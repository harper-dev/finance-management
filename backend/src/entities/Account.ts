import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm'
import { Workspace } from './Workspace'

@Entity('accounts')
@Index(['workspaceId'])
@Index(['createdBy'])
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string

  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ type: 'varchar', length: 50 })
  type: string

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number

  @Column({ type: 'varchar', length: 3, default: 'SGD' })
  currency: string

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

export interface CreateAccountDto {
  workspaceId: string
  name: string
  type: string
  balance?: number
  currency?: string
  isActive?: boolean
  createdBy: string
}

export interface UpdateAccountDto {
  name?: string
  type?: string
  balance?: number
  currency?: string
  isActive?: boolean
}