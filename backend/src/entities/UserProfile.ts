export interface UserProfile {
  id: string
  user_id: string
  display_name?: string
  preferred_currency: string
  timezone: string
  language: string
  created_at: Date
  updated_at: Date
}

export interface CreateUserProfile {
  user_id: string
  display_name?: string
  preferred_currency?: string
  timezone?: string
  language?: string
}

export interface UpdateUserProfile {
  display_name?: string
  preferred_currency?: string
  timezone?: string
  language?: string
}