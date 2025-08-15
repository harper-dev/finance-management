import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'

@Entity('user_profiles')
@Index(['userId'], { unique: true })
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string

  @Column({ name: 'display_name', type: 'varchar', nullable: true })
  displayName?: string

  @Column({ name: 'preferred_currency', type: 'varchar', length: 3, default: 'SGD' })
  preferredCurrency: string

  @Column({ type: 'varchar', length: 50, default: 'Asia/Singapore' })
  timezone: string

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}

export interface CreateUserProfileDto {
  userId: string
  displayName?: string
  preferredCurrency?: string
  timezone?: string
  language?: string
}

export interface UpdateUserProfileDto {
  displayName?: string
  preferredCurrency?: string
  timezone?: string
  language?: string
}