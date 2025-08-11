import { useState } from 'react'
import { Bell, ChevronDown, Settings, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/stores/authStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { formatCurrency } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import WorkspaceSwitcher from './WorkspaceSwitcher'

export default function Header() {
  const { user, profile, signOut } = useAuthStore()
  const { currentWorkspace, clearWorkspaces } = useWorkspaceStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    console.log('Sign out clicked')
    try {
      clearWorkspaces()
      await signOut()
      console.log('Sign out completed, redirecting...')
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Error during sign out:', error)
      // Force redirect even if sign out fails
      navigate('/login', { replace: true })
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-screen-2xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo and Workspace */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">FM</span>
              </div>
              <h1 className="text-xl font-semibold">Finance Manager</h1>
            </div>
            
            {currentWorkspace && (
              <div className="hidden md:block">
                <WorkspaceSwitcher />
              </div>
            )}
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            {/* User menu */}
            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center space-x-2"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium">
                    {profile?.display_name || user?.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currentWorkspace?.name || 'No workspace'}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>

              {/* User dropdown menu */}
              {showUserMenu && (
                <Card className="absolute right-0 top-full mt-2 w-56 p-2 shadow-lg">
                  <div className="space-y-2">
                    <div className="px-3 py-2 border-b">
                      <div className="font-medium">{profile?.display_name || 'User'}</div>
                      <div className="text-sm text-muted-foreground">{user?.email}</div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-600"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile workspace switcher */}
      <div className="md:hidden border-t px-4 py-2">
        <WorkspaceSwitcher />
      </div>
    </header>
  )
}