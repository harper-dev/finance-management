import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { UserProfile, CreateUserProfile, UpdateUserProfile } from '../entities'
import { UserProfileRepository, WorkspaceRepository } from '../repositories'

export class AuthService {
  private userProfileRepo: UserProfileRepository
  private workspaceRepo: WorkspaceRepository

  constructor(supabase: SupabaseClient<Database>) {
    this.userProfileRepo = new UserProfileRepository(supabase)
    this.workspaceRepo = new WorkspaceRepository(supabase)
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    let profile = await this.userProfileRepo.findByUserId(userId)
    
    // Auto-create profile if it doesn't exist
    if (!profile) {
      profile = await this.userProfileRepo.create({ user_id: userId })
    }
    
    return profile
  }

  async createUserProfile(userId: string, profileData: CreateUserProfile): Promise<{
    profile: UserProfile
    workspace?: any
  }> {
    // Create user profile
    const profile = await this.userProfileRepo.create({
      ...profileData,
      user_id: userId
    })

    // Create default personal workspace
    try {
      const workspace = await this.workspaceRepo.create({
        name: 'Personal Finance',
        type: 'personal',
        owner_id: userId,
        currency: profileData.preferred_currency || 'SGD'
      })

      // Add user as owner member
      await this.workspaceRepo.addMember({
        workspace_id: workspace.id,
        user_id: userId,
        role: 'owner'
      })

      return { profile, workspace }
    } catch (error) {
      console.error('Failed to create default workspace:', error)
      return { profile }
    }
  }

  async updateUserProfile(userId: string, updates: UpdateUserProfile): Promise<UserProfile> {
    return await this.userProfileRepo.update(userId, updates)
  }
}