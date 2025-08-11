import { useState, useEffect } from 'react'
import { ChevronDown, Plus, Users, User, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'

export default function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, setCurrentWorkspace, loadWorkspaces } = useWorkspaceStore()
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadWorkspaces()
  }, [loadWorkspaces])

  const getWorkspaceIcon = (type: string) => {
    switch (type) {
      case 'personal':
        return User
      case 'family':
        return Users
      case 'team':
        return Building
      default:
        return User
    }
  }

  const getWorkspaceColor = (type: string) => {
    switch (type) {
      case 'personal':
        return 'bg-blue-500'
      case 'family':
        return 'bg-green-500'
      case 'team':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (!currentWorkspace) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => navigate('/workspaces/new')}
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Workspace
      </Button>
    )
  }

  const Icon = getWorkspaceIcon(currentWorkspace.type)

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="flex items-center space-x-2"
        onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
      >
        <div className={cn("h-6 w-6 rounded flex items-center justify-center", getWorkspaceColor(currentWorkspace.type))}>
          <Icon className="h-3 w-3 text-white" />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">{currentWorkspace.name}</span>
          <span className="text-xs text-muted-foreground capitalize">{currentWorkspace.type}</span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {/* Workspace dropdown menu */}
      {showWorkspaceMenu && (
        <Card className="absolute left-0 top-full mt-2 w-72 p-2 shadow-lg z-50">
          <div className="space-y-1">
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Your Workspaces
            </div>
            
            {workspaces.map((workspace) => {
              const WorkspaceIcon = getWorkspaceIcon(workspace.type)
              const isSelected = workspace.id === currentWorkspace.id
              
              return (
                <Button
                  key={workspace.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start p-2 h-auto",
                    isSelected && "bg-muted"
                  )}
                  onClick={() => {
                    setCurrentWorkspace(workspace)
                    setShowWorkspaceMenu(false)
                  }}
                >
                  <div className={cn("h-8 w-8 rounded flex items-center justify-center mr-3", getWorkspaceColor(workspace.type))}>
                    <WorkspaceIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col items-start flex-1">
                    <span className="font-medium">{workspace.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {workspace.type} • {workspace.currency}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                  )}
                </Button>
              )
            })}
            
            <div className="border-t pt-2 mt-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setShowWorkspaceMenu(false)
                  navigate('/workspaces/new')
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create new workspace
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}