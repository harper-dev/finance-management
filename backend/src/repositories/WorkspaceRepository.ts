import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm'
import { Workspace } from '../entities/Workspace'
import { UserProfile } from '../entities/UserProfile'
import { BaseRepository } from './base/BaseRepository'
import { AppDataSource } from '../config/database'
import { CreateWorkspaceDto, UpdateWorkspaceDto } from '../entities'

export interface WorkspaceFilter {
  ownerId?: string
  type?: string
}

export interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  permissions: Record<string, any>
  joinedAt: Date
}

export class WorkspaceRepository extends BaseRepository<Workspace> {
  private userProfileRepository: Repository<UserProfile>

  constructor() {
    super(Workspace)
    this.userProfileRepository = AppDataSource.getRepository(UserProfile)
  }

  async findByFilter(
    filter: WorkspaceFilter,
    options?: FindManyOptions<Workspace>
  ): Promise<Workspace[]> {
    const where: FindOptionsWhere<Workspace> = {}

    if (filter.ownerId) {
      where.ownerId = filter.ownerId
    }

    if (filter.type) {
      where.type = filter.type as any
    }

    return this.repository.find({
      where,
      order: { createdAt: 'DESC' },
      ...options
    })
  }

  async findByOwner(ownerId: string): Promise<Workspace[]> {
    return this.findByFilter({ ownerId })
  }

  async findUserWorkspaces(userId: string): Promise<Workspace[]> {
    // This would need a proper workspace_members table in a real implementation
    // For now, we'll return workspaces where the user is the owner
    return this.findByOwner(userId)
  }

  async isMember(workspaceId: string, userId: string): Promise<boolean> {
    // Check if user is owner
    const workspace = await this.findById(workspaceId)
    if (workspace && workspace.ownerId === userId) {
      return true
    }

    // In a real implementation, you would check the workspace_members table
    // For now, we'll assume only owners have access
    return false
  }

  async getWorkspaceWithDetails(workspaceId: string): Promise<{
    workspace: Workspace
    memberCount: number
    totalBalance: number
    activeAccounts: number
  } | null> {
    const workspace = await this.findById(workspaceId)
    if (!workspace) return null

    // Get related data
    const [accounts, transactions] = await Promise.all([
      AppDataSource.getRepository('accounts').find({
        where: { workspaceId, isActive: true }
      }),
      AppDataSource.getRepository('transactions').find({
        where: { workspaceId }
      })
    ])

    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0)
    const activeAccounts = accounts.length
    const memberCount = 1 // Simplified - would be from workspace_members table

    return {
      workspace,
      memberCount,
      totalBalance,
      activeAccounts
    }
  }

  async createWorkspace(workspaceData: CreateWorkspaceDto): Promise<Workspace> {
    // Validate owner exists
    const owner = await this.userProfileRepository.findOne({
      where: { userId: workspaceData.ownerId }
    })

    if (!owner) {
      throw new Error('Owner user profile not found')
    }

    return this.create(workspaceData)
  }

  async updateWorkspace(
    id: string,
    updates: UpdateWorkspaceDto
  ): Promise<Workspace | null> {
    return this.update(id, updates)
  }

  async deleteWorkspace(id: string): Promise<boolean> {
    // Check if workspace has any active accounts or transactions
    const [accounts, transactions] = await Promise.all([
      AppDataSource.getRepository('accounts').count({
        where: { workspaceId: id, isActive: true }
      }),
      AppDataSource.getRepository('transactions').count({
        where: { workspaceId: id }
      })
    ])

    if (accounts > 0 || transactions > 0) {
      throw new Error('Cannot delete workspace with active accounts or transactions')
    }

    return this.delete(id)
  }

  async getWorkspaceStats(workspaceId: string): Promise<{
    totalAccounts: number
    activeAccounts: number
    totalTransactions: number
    monthlyIncome: number
    monthlyExpenses: number
    netMonthlyChange: number
  }> {
    const [accounts, transactions] = await Promise.all([
      AppDataSource.getRepository('accounts').find({
        where: { workspaceId }
      }),
      AppDataSource.getRepository('transactions').find({
        where: { workspaceId }
      })
    ])

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.transactionDate)
      return transactionDate >= startOfMonth && transactionDate <= endOfMonth
    })

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    return {
      totalAccounts: accounts.length,
      activeAccounts: accounts.filter(a => a.isActive).length,
      totalTransactions: transactions.length,
      monthlyIncome,
      monthlyExpenses,
      netMonthlyChange: monthlyIncome - monthlyExpenses
    }
  }
}