export type WorkspaceType = 'personal' | 'family' | 'team'
export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface Workspace {
  id: string
  name: string
  type: WorkspaceType
  owner_id: string
  currency: string
  created_at: Date
  updated_at: Date
}

export interface CreateWorkspace {
  name: string
  type: WorkspaceType
  owner_id: string
  currency?: string
}

export interface UpdateWorkspace {
  name?: string
  type?: WorkspaceType
  currency?: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: MemberRole
  permissions: Record<string, any>
  joined_at: Date
}

export interface CreateWorkspaceMember {
  workspace_id: string
  user_id: string
  role: MemberRole
  permissions?: Record<string, any>
}

export interface UpdateWorkspaceMember {
  role?: MemberRole
  permissions?: Record<string, any>
}