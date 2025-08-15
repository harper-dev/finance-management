import { UserProfile, CreateUserProfileDto, UpdateUserProfileDto } from '../entities'
import { UserProfileRepository, WorkspaceRepository } from '../repositories'

export class AuthService {
  private userProfileRepo: UserProfileRepository
  private workspaceRepo: WorkspaceRepository

  constructor() {
    this.userProfileRepo = new UserProfileRepository()
    this.workspaceRepo = new WorkspaceRepository()
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      let profile = await this.userProfileRepo.findByUserId(userId)
      
      // Auto-create profile if it doesn't exist
      if (!profile) {
        profile = await this.userProfileRepo.createProfile({ 
          userId,
          displayName: 'User',
          preferredCurrency: 'USD',
          timezone: 'UTC',
          language: 'en'
        })
      }
      
      return profile
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  async createUserProfile(profileData: CreateUserProfileDto): Promise<UserProfile> {
    try {
      // Create user profile using the correct method name
      const profile = await this.userProfileRepo.createProfile(profileData)
      return profile
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }

  async updateUserProfile(userId: string, updates: UpdateUserProfileDto): Promise<UserProfile | null> {
    try {
      return await this.userProfileRepo.updateProfile(userId, updates)
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }
}