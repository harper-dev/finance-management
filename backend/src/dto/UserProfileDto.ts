import { z } from 'zod'
import { userProfileCreateSchema, userProfileUpdateSchema } from '../utils/validation'

export type CreateUserProfileDto = z.infer<typeof userProfileCreateSchema>
export type UpdateUserProfileDto = z.infer<typeof userProfileUpdateSchema>

export interface UserProfileResponseDto {
  id: string
  user_id: string
  display_name?: string
  preferred_currency: string
  timezone: string
  language: string
  created_at: string
  updated_at: string
}

export interface UserWithProfileResponseDto {
  user: {
    id: string
    email: string
  }
  profile: UserProfileResponseDto
}