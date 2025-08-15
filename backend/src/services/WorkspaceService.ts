import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { Workspace, WorkspaceMember, CreateWorkspace, UpdateWorkspace, CreateWorkspaceMember, UpdateWorkspaceMember } from '../entities'
import { WorkspaceRepository } from '../repositories'
import { PaginationOptions } from '../repositories/base/BaseRepository'

export class WorkspaceService {
  private workspaceRepo: WorkspaceRepository

  constructor(supabase: SupabaseClient<Database>) {
    this.workspaceRepo = new WorkspaceRepository(supabase)
  }

  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    return await this.workspaceRepo.findUserWorkspaces(userId)
  }

  async getWorkspaceById(workspaceId: string, userId: string): Promise<(Workspace & { members: WorkspaceMember[] }) | null> {
    // Check if user has access to this workspace
    const isMember = await this.workspaceRepo.isMember(workspaceId, userId)
    if (!isMember) {
      throw new Error('Access denied: You are not a member of this workspace')
    }

    return await this.workspaceRepo.findWithMembers(workspaceId)
  }

  async createWorkspace(workspaceData: CreateWorkspace, userId: string): Promise<Workspace> {
    // Ensure the creator is set as owner
    const workspaceDataWithOwner = {
      ...workspaceData,
      ownerId: userId  // Use ownerId instead of owner_id
    }
    
    const workspace = await this.workspaceRepo.create(workspaceDataWithOwner)

    // TODO: Add creator as owner member when member management is implemented
    // For now, just return the created workspace
    // await this.workspaceRepo.addMember({
    //   workspace_id: workspace.id,
    //   user_id: userId,
    //   role: 'owner'
    // })

    return workspace
  }

  async updateWorkspace(workspaceId: string, updates: UpdateWorkspace, userId: string): Promise<Workspace> {
    await this.checkWorkspaceAccess(workspaceId, userId, ['owner', 'admin'])
    return await this.workspaceRepo.update(workspaceId, updates)
  }

  async deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
    await this.checkWorkspaceAccess(workspaceId, userId, ['owner'])
    await this.workspaceRepo.delete(workspaceId)
  }

  async inviteUser(workspaceId: string, targetUserId: string, role: 'admin' | 'member' | 'viewer', inviterId: string): Promise<WorkspaceMember> {
    await this.checkWorkspaceAccess(workspaceId, inviterId, ['owner', 'admin'])

    // Check if user is already a member
    const existingMember = await this.workspaceRepo.isMember(workspaceId, targetUserId)
    if (existingMember) {
      throw new Error('User is already a member of this workspace')
    }

    return await this.workspaceRepo.addMember({
      workspace_id: workspaceId,
      user_id: targetUserId,
      role
    })
  }

  async updateMemberRole(
    workspaceId: string,
    targetUserId: string,
    newRole: 'admin' | 'member' | 'viewer',
    updaterId: string
  ): Promise<WorkspaceMember> {
    await this.checkWorkspaceAccess(workspaceId, updaterId, ['owner', 'admin'])

    // Can't change owner role
    const targetRole = await this.workspaceRepo.getUserRole(workspaceId, targetUserId)
    if (targetRole === 'owner') {
      throw new Error('Cannot modify owner role')
    }

    return await this.workspaceRepo.updateMember(workspaceId, targetUserId, { role: newRole })
  }

  async removeMember(workspaceId: string, targetUserId: string, removerId: string): Promise<void> {
    await this.checkWorkspaceAccess(workspaceId, removerId, ['owner', 'admin'])

    // Can't remove owner
    const targetRole = await this.workspaceRepo.getUserRole(workspaceId, targetUserId)
    if (targetRole === 'owner') {
      throw new Error('Cannot remove workspace owner')
    }

    await this.workspaceRepo.removeMember(workspaceId, targetUserId)
  }

  private async checkWorkspaceAccess(workspaceId: string, userId: string, allowedRoles: string[]): Promise<void> {
    const userRole = await this.workspaceRepo.getUserRole(workspaceId, userId)
    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new Error('Access denied: Insufficient permissions')
    }
  }

  async checkWorkspaceMembership(workspaceId: string, userId: string): Promise<boolean> {
    return await this.workspaceRepo.isMember(workspaceId, userId)
  }

  async getUserRole(workspaceId: string, userId: string): Promise<string | null> {
    return await this.workspaceRepo.getUserRole(workspaceId, userId)
  }
}