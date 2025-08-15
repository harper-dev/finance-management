import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm'
import { UserSettings } from '../entities/UserSettings'
import { BaseRepository } from './base/BaseRepository'
import { AppDataSource } from '../config/database'
import { CreateUserSettingsDto, UpdateUserSettingsDto } from '../entities'

export interface UserSettingsFilter {
  userId?: string
  language?: string
  currency?: string
  emailNotifications?: boolean
}

export class UserSettingsRepository extends BaseRepository<UserSettings> {
  constructor() {
    super(UserSettings)
  }

  async findByFilter(
    filter: UserSettingsFilter,
    options?: FindManyOptions<UserSettings>
  ): Promise<UserSettings[]> {
    const where: FindOptionsWhere<UserSettings> = {}

    if (filter.userId) {
      where.userId = filter.userId
    }

    if (filter.language) {
      where.language = filter.language
    }

    if (filter.currency) {
      where.preferredCurrency = filter.currency
    }

    if (filter.emailNotifications !== undefined) {
      where.emailNotifications = filter.emailNotifications
    }

    return this.repository.find({
      where,
      order: { createdAt: 'DESC' },
      ...options
    })
  }

  async findByUserId(userId: string): Promise<UserSettings | null> {
    return this.repository.findOne({
      where: { userId }
    })
  }

  async createSettings(settingsData: CreateUserSettingsDto): Promise<UserSettings> {
    return this.create(settingsData)
  }

  async updateSettings(
    userId: string,
    updates: UpdateUserSettingsDto
  ): Promise<UserSettings | null> {
    const settings = await this.findByUserId(userId)
    if (!settings) return null

    return this.update(settings.id, updates)
  }

  async deleteSettings(userId: string): Promise<boolean> {
    const settings = await this.findByUserId(userId)
    if (!settings) return false

    return this.delete(settings.id)
  }

  async getSettingsByLanguage(language: string): Promise<UserSettings[]> {
    return this.findByFilter({ language })
  }

  async getSettingsByCurrency(currency: string): Promise<UserSettings[]> {
    return this.findByFilter({ currency })
  }

  async getUsersWithEmailNotifications(): Promise<UserSettings[]> {
    return this.findByFilter({ emailNotifications: true })
  }

  async getUsersWithPushNotifications(): Promise<UserSettings[]> {
    return this.repository.find({
      where: { pushNotifications: true }
    })
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: {
      emailNotifications?: boolean
      pushNotifications?: boolean
      weeklyReports?: boolean
      budgetAlerts?: boolean
      goalReminders?: boolean
    }
  ): Promise<UserSettings | null> {
    const settings = await this.findByUserId(userId)
    if (!settings) return null

    return this.update(settings.id, preferences)
  }

  async getSettingsSummary(): Promise<{
    totalUsers: number
    usersWithEmailNotifications: number
    usersWithPushNotifications: number
    mostCommonLanguage: string
    mostCommonCurrency: string
  }> {
    const allSettings = await this.repository.find()
    
    const totalUsers = allSettings.length
    const usersWithEmailNotifications = allSettings.filter(s => s.emailNotifications).length
    const usersWithPushNotifications = allSettings.filter(s => s.pushNotifications).length

    // Find most common language
    const languageCount = new Map<string, number>()
    allSettings.forEach(s => {
      languageCount.set(s.language, (languageCount.get(s.language) || 0) + 1)
    })
    const mostCommonLanguage = Array.from(languageCount.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'en'

    // Find most common currency
    const currencyCount = new Map<string, number>()
    allSettings.forEach(s => {
      currencyCount.set(s.preferredCurrency, (currencyCount.get(s.preferredCurrency) || 0) + 1)
    })
    const mostCommonCurrency = Array.from(currencyCount.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'USD'

    return {
      totalUsers,
      usersWithEmailNotifications,
      usersWithPushNotifications,
      mostCommonLanguage,
      mostCommonCurrency
    }
  }
}