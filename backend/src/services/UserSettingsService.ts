import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { UserSettings, CreateUserSettings, UpdateUserSettings } from '../entities'
import { UserSettingsRepository } from '../repositories'
import { AppError, ErrorType } from '../utils/errors'

interface SettingsCache {
  [userId: string]: {
    settings: UserSettings
    timestamp: number
  }
}

export class UserSettingsService {
  private userSettingsRepo: UserSettingsRepository
  private cache: SettingsCache = {}
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  constructor(supabase: SupabaseClient<Database>) {
    this.userSettingsRepo = new UserSettingsRepository(supabase)
  }

  async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      // Check cache first
      const cached = this.cache[userId]
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.settings
      }

      // Fetch from database
      let settings = await this.userSettingsRepo.findByUserId(userId)
      
      // If no settings exist, create default settings
      if (!settings) {
        settings = await this.createDefaultSettings(userId)
      }

      // Update cache
      this.cache[userId] = {
        settings,
        timestamp: Date.now()
      }

      return settings
    } catch (error) {
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        `Failed to retrieve user settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      )
    }
  }

  async updateUserSettings(userId: string, updates: UpdateUserSettings): Promise<UserSettings> {
    try {
      // Validate the updates
      this.validateSettingsUpdate(updates)

      // Get current settings to compare for audit trail
      const currentSettings = await this.getUserSettings(userId)
      
      // Update settings in database
      const updatedSettings = await this.userSettingsRepo.update(userId, updates)

      // Clear cache for this user
      delete this.cache[userId]

      // Log audit trail
      await this.logSettingsChange(userId, currentSettings, updatedSettings, updates)

      return updatedSettings
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        `Failed to update user settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      )
    }
  }

  async createDefaultSettings(userId: string): Promise<UserSettings> {
    try {
      const defaultSettings: CreateUserSettings = {
        user_id: userId,
        preferred_currency: 'USD',
        timezone: 'UTC',
        date_format: 'MM/DD/YYYY',
        language: 'en',
        email_notifications: true,
        push_notifications: false,
        weekly_reports: true,
        budget_alerts: true,
        goal_reminders: true
      }

      return await this.userSettingsRepo.create(defaultSettings)
    } catch (error) {
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        `Failed to create default user settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      )
    }
  }

  private validateSettingsUpdate(updates: UpdateUserSettings): void {
    // Validate currency
    if (updates.preferred_currency) {
      const validCurrencies = ['USD', 'EUR', 'GBP', 'CNY', 'JPY', 'SGD', 'AUD', 'CAD']
      if (!validCurrencies.includes(updates.preferred_currency)) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          `Invalid currency: ${updates.preferred_currency}. Must be one of: ${validCurrencies.join(', ')}`,
          422
        )
      }
    }

    // Validate date format
    if (updates.date_format) {
      const validFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY']
      if (!validFormats.includes(updates.date_format)) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          `Invalid date format: ${updates.date_format}. Must be one of: ${validFormats.join(', ')}`,
          422
        )
      }
    }

    // Validate language
    if (updates.language) {
      const validLanguages = ['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko']
      if (!validLanguages.includes(updates.language)) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          `Invalid language: ${updates.language}. Must be one of: ${validLanguages.join(', ')}`,
          422
        )
      }
    }

    // Validate display name length
    if (updates.display_name !== undefined) {
      if (updates.display_name && updates.display_name.length > 100) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'Display name cannot exceed 100 characters',
          422
        )
      }
    }

    // Validate timezone (basic check)
    if (updates.timezone) {
      if (updates.timezone.length > 50) {
        throw new AppError(
          ErrorType.VALIDATION_ERROR,
          'Timezone identifier cannot exceed 50 characters',
          422
        )
      }
    }
  }

  private async logSettingsChange(
    userId: string,
    oldSettings: UserSettings,
    newSettings: UserSettings,
    updates: UpdateUserSettings
  ): Promise<void> {
    try {
      // Create a simple audit log entry
      const changes: Record<string, { old: any; new: any }> = {}
      
      Object.keys(updates).forEach(key => {
        const oldValue = (oldSettings as any)[key]
        const newValue = (newSettings as any)[key]
        if (oldValue !== newValue) {
          changes[key] = { old: oldValue, new: newValue }
        }
      })

      // Log to console for now (in production, this would go to a proper audit log)
      console.log(`[AUDIT] User ${userId} settings changed:`, {
        timestamp: new Date().toISOString(),
        userId,
        changes
      })
    } catch (error) {
      // Don't throw on audit log failures, just log the error
      console.error('Failed to log settings change:', error)
    }
  }

  // Clear cache for a specific user (useful for testing or manual cache invalidation)
  clearUserCache(userId: string): void {
    delete this.cache[userId]
  }

  // Clear all cache (useful for testing)
  clearAllCache(): void {
    this.cache = {}
  }
}