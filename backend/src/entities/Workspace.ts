import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { UserProfile } from './UserProfile'
import { Account } from './Account'
import { Transaction } from './Transaction'
import { Budget } from './Budget'
import { SavingsGoal } from './SavingsGoal'

export type WorkspaceType = 'personal' | 'family' | 'team'
export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer'

@Entity('workspaces')
@Index(['ownerId'])
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ type: 'varchar', length: 20 })
  type: WorkspaceType

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string

  @Column({ type: 'varchar', length: 3, default: 'SGD' })
  currency: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'owner_id' })
  owner: UserProfile

  @OneToMany(() => Account, account => account.workspace)
  accounts: Account[]

  @OneToMany(() => Transaction, transaction => transaction.workspace)
  transactions: Transaction[]

  @OneToMany(() => Budget, budget => budget.workspace)
  budgets: Budget[]

  @OneToMany(() => SavingsGoal, goal => goal.workspace)
  savingsGoals: SavingsGoal[]
}

export interface CreateWorkspaceDto {
  name: string
  type: WorkspaceType
  ownerId: string
  currency?: string
}

export interface UpdateWorkspaceDto {
  name?: string
  type?: WorkspaceType
  currency?: string
}

export interface WorkspaceMemberDto {
  id: string
  workspaceId: string
  userId: string
  role: MemberRole
  permissions: Record<string, any>
  joinedAt: Date
}

export interface CreateWorkspaceMemberDto {
  workspaceId: string
  userId: string
  role: MemberRole
  permissions?: Record<string, any>
}

export interface UpdateWorkspaceMemberDto {
  role?: MemberRole
  permissions?: Record<string, any>
}