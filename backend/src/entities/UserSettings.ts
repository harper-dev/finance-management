import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity('user_settings')
@Index(['userId'], { unique: true })
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string

  @Column({ name: 'notification_preferences', type: 'jsonb', default: {} })
  notificationPreferences: object

  @Column({ name: 'theme_preferences', type: 'jsonb', default: {} })
  themePreferences: object

  @Column({ name: 'data_privacy_settings', type: 'jsonb', default: {} })
  dataPrivacySettings: object

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}

export interface CreateUserSettingsDto {
  userId: string
  notificationPreferences?: object
  themePreferences?: object
  dataPrivacySettings?: object
}

export interface UpdateUserSettingsDto {
  notificationPreferences?: object
  themePreferences?: object
  dataPrivacySettings?: object
}