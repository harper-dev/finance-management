import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseClient } from '../services/supabase'
import { AuthService } from '../services'
import { requireAuth, AuthUser } from '../middleware/auth'
import { successResponse, errorResponse } from '../utils/response'
import { validateRequest, userProfileCreateSchema, userProfileUpdateSchema } from '../utils/validation'
import { Env } from '../types/env'
import { z } from 'zod'

const auth = new Hono<{ Bindings: Env, Variables: { user: AuthUser } }>()

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  display_name: z.string().optional()
})

// Login endpoint
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password } = validateRequest(loginSchema, body)
    
    // Use anon key for auth operations, not service key
    const supabase = createClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
          },
        },
      }
    );
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return errorResponse(c, error.message, 401)
    }

    if (!data.session) {
      return errorResponse(c, 'Login failed', 401)
    }

    // Get user profile
    const authService = new AuthService(supabase)
    let profile = null
    try {
      profile = await authService.getUserProfile(data.user.id)
    } catch (profileError) {
      // Profile might not exist yet, that's ok
    }

    return successResponse(c, {
      user: data.user,
      session: data.session,
      profile
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Login failed: ${error}`, 500)
  }
})

// Register endpoint  
auth.post('/register', async (c) => {
  try {
    console.log('Register endpoint called');
    const body = await c.req.json()
    console.log('Request body:', body);
    
    const { email, password, display_name } = validateRequest(registerSchema, body)
    console.log('Validated data:', { email, password: '***', display_name });
    console.log('Environment check:', { 
      SUPABASE_URL: c.env.SUPABASE_URL, 
      SUPABASE_ANON_KEY: c.env.SUPABASE_ANON_KEY ? 'present' : 'missing' 
    });
    
    // Use anon key for auth operations, not service key
    const supabase = createClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            'apikey': c.env.SUPABASE_ANON_KEY,
          },
        },
      }
    );
    console.log('Supabase client created with anon key');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name
        }
      }
    })

    console.log('Supabase signUp result:', { user: !!data?.user, error: error?.message });

    if (error) {
      console.error('Supabase signUp error:', error);
      return errorResponse(c, error.message, 400)
    }

    if (!data.user) {
      console.error('No user returned from signUp');
      return errorResponse(c, 'Registration failed', 400)
    }

    console.log('Registration successful');
    return successResponse(c, {
      user: data.user,
      session: data.session,
      message: 'Registration successful. Please check your email for verification.'
    })
  } catch (error) {
    console.error('Register endpoint error:', error);
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Registration failed: ${error}`, 500)
  }
})

// Logout endpoint
auth.post('/logout', requireAuth(), async (c) => {
  try {
    const supabase = getSupabaseClient(c.env)
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return errorResponse(c, error.message, 500)
    }
    
    return successResponse(c, null, 'Logout successful')
  } catch (error) {
    return errorResponse(c, `Logout failed: ${error}`, 500)
  }
})

// Get current user profile
auth.get('/me', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const supabase = getSupabaseClient(c.env)
    const authService = new AuthService(supabase)
    
    const profile = await authService.getUserProfile(user.id)
    
    return successResponse(c, { user, profile })
  } catch (error) {
    return errorResponse(c, `Failed to get user profile: ${error}`, 500)
  }
})

// Update user profile
auth.put('/profile', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const validatedData = validateRequest(userProfileUpdateSchema, body)
    
    const supabase = getSupabaseClient(c.env)
    const authService = new AuthService(supabase)
    
    const profile = await authService.updateUserProfile(user.id, validatedData)
    
    return successResponse(c, profile, 'Profile updated successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to update profile: ${error}`, 500)
  }
})

// Create user profile (called after sign up)
auth.post('/profile', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const validatedData = validateRequest(userProfileCreateSchema, body)
    
    const supabase = getSupabaseClient(c.env)
    const authService = new AuthService(supabase)
    
    // The service expects CreateUserProfile interface which requires user_id, but it adds it internally
    const result = await authService.createUserProfile(user.id, validatedData as any)
    
    return successResponse(c, result, 'Profile created successfully')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    if (error instanceof Error && error.message.includes('already exists')) {
      return errorResponse(c, 'Profile already exists', 409)
    }
    return errorResponse(c, `Failed to create profile: ${error}`, 500)
  }
})

export default auth