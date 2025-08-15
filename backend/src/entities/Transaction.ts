import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm'
import { Account } from './Account'
import { Workspace } from './Workspace'

@Entity('transactions')
@Index(['workspaceId'])
@Index(['accountId'])
@Index(['transactionDate'])
@Index(['createdBy'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string

  @Column({ type: 'varchar', length: 20 })
  type: string

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number

  @Column({ type: 'varchar', length: 3 })
  currency: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: Date

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace
}

export interface CreateTransactionDto {
  workspaceId: string
  accountId: string
  type: string
  amount: number
  currency: string
  category?: string
  description?: string
  transactionDate: Date
  createdBy: string
}

export interface UpdateTransactionDto {
  type?: string
  amount?: number
  currency?: string
  category?: string
  description?: string
  transactionDate?: Date
}

export interface TransactionFilterDto {
  accountId?: string
  type?: string
  category?: string
  startDate?: Date
  endDate?: Date
  minAmount?: number
  maxAmount?: number
}