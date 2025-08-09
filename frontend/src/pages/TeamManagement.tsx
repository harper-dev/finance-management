import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Plus,
  Mail,
  Shield,
  MoreVertical,
  Crown,
  User,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/services/api';

interface WorkspaceMember {
  id: string;
  user_id: string;
  workspace_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: Record<string, boolean>;
  joined_at: string;
  user: {
    email: string;
    display_name?: string;
  };
}

const ROLE_COLORS = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  member: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800'
};

const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  member: User,
  viewer: Eye
};

export default function TeamManagement() {
  const { currentWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Fetch workspace members
  const { data: members, isLoading } = useQuery<WorkspaceMember[]>({
    queryKey: ['workspace-members', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace) return [];
      
      // Note: This endpoint may not exist yet, returning mock data
      return [
        {
          id: '1',
          user_id: 'user1',
          workspace_id: currentWorkspace.id,
          role: 'owner',
          permissions: {},
          joined_at: '2024-01-01T00:00:00Z',
          user: {
            email: user?.email || 'owner@example.com',
            display_name: user?.email?.split('@')[0] || 'Workspace Owner'
          }
        },
        {
          id: '2',
          user_id: 'user2',
          workspace_id: currentWorkspace.id,
          role: 'admin',
          permissions: {},
          joined_at: '2024-02-01T00:00:00Z',
          user: {
            email: 'admin@example.com',
            display_name: 'Admin User'
          }
        },
        {
          id: '3',
          user_id: 'user3',
          workspace_id: currentWorkspace.id,
          role: 'member',
          permissions: {},
          joined_at: '2024-03-01T00:00:00Z',
          user: {
            email: 'member@example.com',
            display_name: 'Team Member'
          }
        }
      ];
    },
    enabled: !!currentWorkspace,
  });

  // Invite member mutation
  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      if (!currentWorkspace) throw new Error('No workspace selected');
      return apiClient.inviteToWorkspace(currentWorkspace.id, email, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('member');
      setInviteError(null);
    },
    onError: (error: any) => {
      setInviteError(error.message || 'Failed to send invitation');
    },
  });

  // Update member role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      // Note: This endpoint may not exist yet
      return (apiClient as any).updateWorkspaceMember(memberId, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      // Note: This endpoint may not exist yet
      return (apiClient as any).removeWorkspaceMember(memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
    },
  });

  const handleInvite = () => {
    if (!inviteEmail) {
      setInviteError('Please enter an email address');
      return;
    }

    setInviteError(null);
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const handleUpdateRole = (memberId: string, newRole: string) => {
    updateRoleMutation.mutate({ memberId, role: newRole });
  };

  const handleRemoveMember = (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      removeMemberMutation.mutate(memberId);
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Full access to all workspace features and settings';
      case 'admin':
        return 'Can manage members, budgets, and all financial data';
      case 'member':
        return 'Can view and edit transactions, budgets, and goals';
      case 'viewer':
        return 'Can only view financial data and reports';
      default:
        return '';
    }
  };

  const canManageMembers = currentWorkspace && (
    members?.find(m => m.user_id === user?.id)?.role === 'owner' ||
    members?.find(m => m.user_id === user?.id)?.role === 'admin'
  );

  if (!currentWorkspace) {
    return (
      <Layout>
        <div className="p-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please select a workspace to manage team members.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
              <p className="text-gray-600 mt-1">
                Manage members and permissions for {currentWorkspace.name}
              </p>
            </div>
            {canManageMembers && (
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join {currentWorkspace.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {inviteError && (
                      <Alert variant="destructive">
                        <AlertDescription>{inviteError}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole as any}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        {getRoleDescription(inviteRole)}
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInvite} disabled={inviteMutation.isPending}>
                      {inviteMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      <Mail className="mr-2 h-4 w-4" />
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Team Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{members?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                <Shield className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {members?.filter(m => ['owner', 'admin'].includes(m.role)).length || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {members?.filter(m => m.role === 'member').length || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Viewers</CardTitle>
                <Eye className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">
                  {members?.filter(m => m.role === 'viewer').length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Members List */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage roles and permissions for workspace members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded-md animate-pulse" />
                  ))}
                </div>
              ) : members && members.length > 0 ? (
                <div className="space-y-4">
                  {members.map((member) => {
                    const RoleIcon = ROLE_ICONS[member.role];
                    const isCurrentUser = member.user_id === user?.id;
                    const canEdit = canManageMembers && !isCurrentUser;

                    return (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium">
                                {member.user.display_name || member.user.email}
                                {isCurrentUser && (
                                  <span className="text-sm text-muted-foreground ml-2">(You)</span>
                                )}
                              </p>
                              <Badge className={ROLE_COLORS[member.role]}>
                                <RoleIcon className="h-3 w-3 mr-1" />
                                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {member.user.email}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              Joined {new Date(member.joined_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {canEdit && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'admin')}>
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'member')}>
                                <User className="h-4 w-4 mr-2" />
                                Make Member
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateRole(member.id, 'viewer')}>
                                <Eye className="h-4 w-4 mr-2" />
                                Make Viewer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members</h3>
                  <p className="text-gray-600 text-center mb-6">
                    Invite team members to collaborate on this workspace.
                  </p>
                  {canManageMembers && (
                    <Button onClick={() => setInviteDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Invite First Member
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role Descriptions */}
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>
                Understanding what each role can do in this workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Crown className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Owner</h4>
                      <p className="text-sm text-muted-foreground">
                        Full control over workspace, including deleting it and managing all members
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Admin</h4>
                      <p className="text-sm text-muted-foreground">
                        Can invite members, manage budgets, goals, and view all financial data
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Member</h4>
                      <p className="text-sm text-muted-foreground">
                        Can add transactions, create personal budgets and goals, view reports
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Eye className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Viewer</h4>
                      <p className="text-sm text-muted-foreground">
                        Read-only access to view financial data and reports
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}