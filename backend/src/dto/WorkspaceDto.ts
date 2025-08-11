import { z } from 'zod'
import { workspaceCreateSchema, workspaceUpdateSchema } from '../utils/validation'

export type CreateWorkspaceDto = z.infer<typeof workspaceCreateSchema>
export type UpdateWorkspaceDto = z.infer<typeof workspaceUpdateSchema>

export interface WorkspaceResponseDto {
  id: string
  name: string
  type: 'personal' | 'family' | 'team'
  owner_id: string
  currency: string
  created_at: string
  updated_at: string
}

export interface WorkspaceMemberDto {
  id: string
  workspace_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  permissions: Record<string, any>
  joined_at: string
}

export interface WorkspaceWithMembersDto extends WorkspaceResponseDto {
  members: WorkspaceMemberDto[]
}

export interface InviteMemberDto {
  user_id: string
  role: 'admin' | 'member' | 'viewer'
}

export interface UpdateMemberRoleDto {
  role: 'admin' | 'member' | 'viewer'
}