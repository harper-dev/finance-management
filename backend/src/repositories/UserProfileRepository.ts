import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm'
import { UserProfile } from '../entities/UserProfile'
import { BaseRepository } from './base/BaseRepository'
import { AppDataSource } from '../config/database'
import { CreateUserProfileDto, UpdateUserProfileDto } from '../entities'

export interface UserProfileFilter {
  userId?: string
  language?: string
  currency?: string
}

export class UserProfileRepository extends BaseRepository<UserProfile> {
  constructor() {
    super(UserProfile)
  }

  async findByFilter(
    filter: UserProfileFilter,
    options?: FindManyOptions<UserProfile>
  ): Promise<UserProfile[]> {
    const where: FindOptionsWhere<UserProfile> = {}

    if (filter.userId) {
      where.userId = filter.userId
    }

    if (filter.language) {
      where.language = filter.language
    }

    if (filter.currency) {
      where.preferredCurrency = filter.currency
    }

    return this.repository.find({
      where,
      order: { createdAt: 'DESC' },
      ...options
    })
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    return this.repository.findOne({
      where: { userId }
    })
  }

  async createProfile(profileData: CreateUserProfileDto): Promise<UserProfile> {
    return this.create(profileData)
  }

  async updateProfile(
    userId: string,
    updates: UpdateUserProfileDto
  ): Promise<UserProfile | null> {
    const profile = await this.findByUserId(userId)
    if (!profile) return null

    return this.update(profile.id, updates)
  }

  async deleteProfile(userId: string): Promise<boolean> {
    const profile = await this.findByUserId(userId)
    if (!profile) return false

    return this.delete(profile.id)
  }

  async getProfilesByLanguage(language: string): Promise<UserProfile[]> {
    return this.findByFilter({ language })
  }

  async getProfilesByCurrency(currency: string): Promise<UserProfile[]> {
    return this.findByFilter({ currency })
  }
}