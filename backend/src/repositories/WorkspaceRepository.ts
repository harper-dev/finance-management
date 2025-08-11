import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { Workspace, WorkspaceMember, CreateWorkspace, UpdateWorkspace, CreateWorkspaceMember, UpdateWorkspaceMember } from '../entities'
import { BaseRepository, PaginationOptions, PaginatedResult } from './base/BaseRepository'

export class WorkspaceRepository extends BaseRepository {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase)
  }

  async findByUserId(userId: string): Promise<Workspace[]> {
    const { data, error } = await this.supabase
      .from('workspace_members')
      .select(`
        workspace_id,
        role,
        workspaces (
          id,
          name,
          type,
          owner_id,
          currency,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }

    return data.map(item => this.mapToEntity(item.workspaces))
  }

  async findById(id: string): Promise<Workspace | null> {
    const { data, error } = await this.supabase
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }

    return data ? this.mapToEntity(data) : null
  }

  async findWithMembers(id: string): Promise<(Workspace & { members: WorkspaceMember[] }) | null> {
    const workspace = await this.findById(id)
    if (!workspace) return null

    const members = await this.findMembersByWorkspaceId(id)
    
    return { ...workspace, members }
  }

  async create(workspace: CreateWorkspace): Promise<Workspace> {
    const { data, error } = await this.supabase
      .from('workspaces')
      .insert([workspace])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapToEntity(data)
  }

  async update(id: string, updates: UpdateWorkspace): Promise<Workspace> {
    const { data, error } = await this.supabase
      .from('workspaces')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapToEntity(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('workspaces')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  // Workspace Members
  async findMembersByWorkspaceId(workspaceId: string): Promise<WorkspaceMember[]> {
    const { data, error } = await this.supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId)

    if (error) {
      throw new Error(error.message)
    }

    return data.map(item => this.mapMemberToEntity(item))
  }

  async addMember(member: CreateWorkspaceMember): Promise<WorkspaceMember> {
    const { data, error } = await this.supabase
      .from('workspace_members')
      .insert([member])
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapMemberToEntity(data)
  }

  async updateMember(workspaceId: string, userId: string, updates: UpdateWorkspaceMember): Promise<WorkspaceMember> {
    const { data, error } = await this.supabase
      .from('workspace_members')
      .update(updates)
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return this.mapMemberToEntity(data)
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(error.message)
    }
  }

  async isMember(workspaceId: string, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }

    return !!data
  }

  async getUserRole(workspaceId: string, userId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }

    return data?.role || null
  }

  private mapToEntity(data: any): Workspace {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      owner_id: data.owner_id,
      currency: data.currency,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    }
  }

  private mapMemberToEntity(data: any): WorkspaceMember {
    return {
      id: data.id,
      workspace_id: data.workspace_id,
      user_id: data.user_id,
      role: data.role,
      permissions: data.permissions || {},
      joined_at: new Date(data.joined_at)
    }
  }
}