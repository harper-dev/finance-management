import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm'
import { Workspace } from './Workspace'

@Entity('savings_goals')
@Index(['workspaceId'])
@Index(['category'])
@Index(['createdBy'])
export class SavingsGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string

  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ name: 'target_amount', type: 'decimal', precision: 15, scale: 2 })
  targetAmount: number

  @Column({ name: 'current_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentAmount: number

  @Column({ name: 'target_date', type: 'date', nullable: true })
  targetDate?: Date

  @Column({ type: 'varchar', length: 50, nullable: true })
  category?: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace
}

export interface CreateSavingsGoalDto {
  workspaceId: string
  name: string
  targetAmount: number
  currentAmount?: number
  targetDate?: Date
  category?: string
  description?: string
  isActive?: boolean
  createdBy: string
}

export interface UpdateSavingsGoalDto {
  name?: string
  targetAmount?: number
  currentAmount?: number
  targetDate?: Date
  category?: string
  description?: string
  isActive?: boolean
}

export interface SavingsGoalWithProgressDto extends SavingsGoal {
  progressPercentage: number
  daysRemaining?: number
  monthlySavingsNeeded: number
  isCompleted: boolean
}