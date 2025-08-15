import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { AuthService } from '../services/AuthService'
import { successResponse, errorResponse } from '../utils/response'
import { validateWithZod, userProfileCreateSchema, userProfileUpdateSchema } from '../utils/validationSchemas'
import { ValidationUtils } from '../utils/validation'
import { logger } from '../config/logging'
import { requireAuth, AuthUser } from '../middleware/auth'
import { Env } from '../types/env'
import 'dotenv/config'

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

// Helper function to create Supabase client
function createSupabaseClient(env?: Env) {
  // Try to get environment variables from multiple sources
  const supabaseUrl = env?.SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = env?.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  
  console.log('Environment check in createSupabaseClient:', {
    fromEnv: {
      SUPABASE_URL: env?.SUPABASE_URL,
      SUPABASE_ANON_KEY: env?.SUPABASE_ANON_KEY ? `${env.SUPABASE_ANON_KEY.substring(0, 20)}...` : 'missing'
    },
    fromProcess: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? `${process.env.SUPABASE_ANON_KEY.substring(0, 20)}...` : 'missing'
    },
    final: {
      SUPABASE_URL: supabaseUrl,
      SUPABASE_ANON_KEY: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'missing'
    },
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey
  })
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(`Supabase configuration is missing. 
    SUPABASE_URL: ${supabaseUrl ? 'set' : 'missing'}
    SUPABASE_ANON_KEY: ${supabaseKey ? 'set' : 'missing'}
    Please check your environment variables.`)
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'apikey': supabaseKey,
      },
    },
  })
}

// Login endpoint
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json()
    
    // Validate input using Zod schema
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse(c, 'Invalid input data', 422)
    }
    
    const { email, password } = validationResult.data
    
    // Create Supabase client
    const supabase = createSupabaseClient(c.env)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Supabase login error:', error)
      return errorResponse(c, error.message, 401)
    }

    if (!data.session) {
      return errorResponse(c, 'Login failed - no session created', 401)
    }

    // Get or create user profile
    const authService = new AuthService()
    let profile = null
    try {
      profile = await authService.getUserProfile(data.user.id)
    } catch (profileError) {
      console.error('Profile retrieval error:', profileError)
    }

    return successResponse(c, {
      user: data.user,
      session: data.session,
      profile
    })
    
  } catch (error) {
    console.error('Login error:', error)
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
    
    // Validate input using Zod schema
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return errorResponse(c, 'Invalid input data', 422)
    }
    
    const { email, password, display_name } = validationResult.data
    console.log('Validated data:', { email, password: '***', display_name });
    
    // Create Supabase client
    const supabase = createSupabaseClient(c.env)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: display_name || 'User'
        }
      }
    })

    if (error) {
      console.error('Supabase registration error:', error)
      return errorResponse(c, error.message, 400)
    }

    if (!data.user) {
      return errorResponse(c, 'Registration failed - no user created', 400)
    }

    // Create user profile in our database
    try {
      const authService = new AuthService()
      const profile = await authService.createUserProfile({
        userId: data.user.id,
        displayName: display_name || 'User',
        preferredCurrency: 'SGD',
        timezone: 'Asia/Singapore',
        language: 'en'
      })
      
      return successResponse(c, {
        message: 'Registration successful',
        user: data.user,
        profile
      })
    } catch (profileError) {
      console.error('Failed to create user profile:', profileError)
      
      // Log the business error
      logger.error('User profile creation failed', {
        error: {
          name: profileError instanceof Error ? profileError.name : 'Unknown',
          message: profileError instanceof Error ? profileError.message : String(profileError),
          stack: profileError instanceof Error ? profileError.stack : undefined
        },
        request: {
          email,
          display_name
        },
        timestamp: new Date().toISOString()
      })
      
      return errorResponse(c, 'User profile creation failed', 500)
    }
    
  } catch (error) {
    console.error('Registration error:', error)
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Registration failed: ${error}`, 500)
  }
})

// Update user profile endpoint
auth.put('/profile', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const validatedData = validateWithZod(userProfileUpdateSchema, body)
    
    const authService = new AuthService()
    
    const updatedProfile = await authService.updateUserProfile(user.id, validatedData)
    
    if (!updatedProfile) {
      return errorResponse(c, 'Profile not found', 404)
    }
    
    return successResponse(c, updatedProfile)
  } catch (error) {
    console.error('Profile update error:', error)
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to update profile: ${error}`, 500)
  }
})

// Create user profile endpoint
auth.post('/profile', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const validatedData = validateWithZod(userProfileCreateSchema, body)
    
    const authService = new AuthService()
    
    const profile = await authService.createUserProfile(validatedData)
    
    return successResponse(c, profile)
  } catch (error) {
    console.error('Profile creation error:', error)
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return errorResponse(c, error.message, 422)
    }
    return errorResponse(c, `Failed to create profile: ${error}`, 500)
  }
})

// Get user profile endpoint
auth.get('/profile', requireAuth(), async (c) => {
  try {
    const user = c.get('user')
    
    const authService = new AuthService()
    
    const profile = await authService.getUserProfile(user.id)
    
    if (!profile) {
      return errorResponse(c, 'Profile not found', 404)
    }
    
    return successResponse(c, profile)
  } catch (error) {
    console.error('Profile retrieval error:', error)
    return errorResponse(c, `Failed to get profile: ${error}`, 500)
  }
})

// Logout endpoint
auth.post('/logout', requireAuth, async (c) => {
  try {
    // Get the authorization header
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(c, 'No valid authorization token', 401)
    }
    
    const token = authHeader.substring(7)
    
    // Create Supabase client and sign out
    const supabase = createSupabaseClient(c.env)
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Supabase logout error:', error)
      return errorResponse(c, error.message, 500)
    }
    
    return successResponse(c, { message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return errorResponse(c, `Logout failed: ${error}`, 500)
  }
})

// Refresh token endpoint
auth.post('/refresh', async (c) => {
  try {
    const body = await c.req.json()
    const { refresh_token } = body
    
    if (!refresh_token) {
      return errorResponse(c, 'Refresh token is required', 400)
    }
    
    // Create Supabase client and refresh session
    const supabase = createSupabaseClient(c.env)
    
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    })
    
    if (error) {
      console.error('Supabase token refresh error:', error)
      return errorResponse(c, error.message, 401)
    }
    
    return successResponse(c, {
      user: data.user,
      session: data.session
    })
    
  } catch (error) {
    console.error('Token refresh error:', error)
    return errorResponse(c, `Token refresh failed: ${error}`, 500)
  }
})

export default auth