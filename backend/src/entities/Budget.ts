import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm'
import { Workspace } from './Workspace'

@Entity('budgets')
@Index(['workspaceId'])
@Index(['category'])
@Index(['createdBy'])
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string

  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ type: 'varchar', length: 50 })
  category: string

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number

  @Column({ type: 'varchar', length: 20 })
  period: string

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace
}

export interface CreateBudgetDto {
  workspaceId: string
  name: string
  category: string
  amount: number
  period: string
  startDate: Date
  endDate?: Date
  isActive?: boolean
  createdBy: string
}

export interface UpdateBudgetDto {
  name?: string
  category?: string
  amount?: number
  period?: string
  startDate?: Date
  endDate?: Date
  isActive?: boolean
}

export interface BudgetWithSpendingDto extends Budget {
  spent: number
  remaining: number
  utilizationPercentage: number
}