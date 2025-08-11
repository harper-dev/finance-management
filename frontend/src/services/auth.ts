interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  display_name?: string
}

interface AuthResponse {
  user: any
  session: any
  profile?: any
  message?: string
}

class AuthService {
  private baseURL: string

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1'
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Login failed')
    }

    // Store the session token
    if (result.data.session?.access_token) {
      localStorage.setItem('auth_token', result.data.session.access_token)
      localStorage.setItem('refresh_token', result.data.session.refresh_token || '')
    }

    return result.data
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Registration failed')
    }

    // Store the session token if provided
    if (result.data.session?.access_token) {
      localStorage.setItem('auth_token', result.data.session.access_token)
      localStorage.setItem('refresh_token', result.data.session.refresh_token || '')
    }

    return result.data
  }

  async logout(): Promise<void> {
    const token = localStorage.getItem('auth_token')
    
    if (token) {
      try {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
      } catch (error) {
        console.error('Logout API call failed:', error)
      }
    }

    // Clear local storage regardless of API call success
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('workspace-store')
  }

  async getMe(): Promise<{ user: any; profile: any }> {
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      throw new Error('No auth token available')
    }

    const response = await fetch(`${this.baseURL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, clear it
        this.logout()
        throw new Error('Authentication expired')
      }
      throw new Error(result.error || 'Failed to get user info')
    }

    return result.data
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}

export const authService = new AuthService()
export default authService