import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  Target, 
  TrendingUp, 
  Settings,
  Plus,
  CreditCard,
  PiggyBank,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Accounts',
    href: '/accounts',
    icon: Wallet,
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: Receipt,
  },
  {
    name: 'Budgets',
    href: '/budgets',
    icon: Target,
  },
  {
    name: 'Savings Goals',
    href: '/savings-goals',
    icon: PiggyBank,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: TrendingUp,
  },
  {
    name: 'Team',
    href: '/team',
    icon: Users,
  },
]

const quickActions = [
  {
    name: 'Add Transaction',
    href: '/transactions/new',
    icon: Plus,
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    name: 'Create Budget',
    href: '/budgets/new',
    icon: Target,
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    name: 'New Goal',
    href: '/savings-goals/new',
    icon: PiggyBank,
    color: 'bg-pink-500 hover:bg-pink-600',
  },
  {
    name: 'New Account',
    href: '/accounts/new',
    icon: CreditCard,
    color: 'bg-purple-500 hover:bg-purple-600',
  },
]

export default function Sidebar({ className }: SidebarProps) {
  const location = useLocation()

  return (
    <div className={cn("flex h-full w-64 flex-col bg-muted/10", className)}>
      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          )
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
        <div className="space-y-2">
          {quickActions.map((action) => (
            <NavLink key={action.name} to={action.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start text-white",
                  action.color
                )}
              >
                <action.icon className="mr-2 h-4 w-4" />
                {action.name}
              </Button>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t">
        <NavLink
          to="/settings"
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
            location.pathname === '/settings'
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </NavLink>
      </div>
    </div>
  )
}