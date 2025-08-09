import { CreditCard, Wallet, TrendingUp, Home, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Account } from '@/types/api'
import { cn } from '@/lib/utils'

interface AccountCardProps {
  account: Account
  onClick?: () => void
}

const accountIcons = {
  cash: Wallet,
  bank: CreditCard,
  investment: TrendingUp,
  asset: Home,
  debt: DollarSign,
}

const accountColors = {
  cash: 'text-green-600 bg-green-100',
  bank: 'text-blue-600 bg-blue-100',
  investment: 'text-purple-600 bg-purple-100',
  asset: 'text-orange-600 bg-orange-100',
  debt: 'text-red-600 bg-red-100',
}

export default function AccountCard({ account, onClick }: AccountCardProps) {
  const Icon = accountIcons[account.type] || Wallet
  const colorClass = accountColors[account.type] || 'text-gray-600 bg-gray-100'
  
  const isDebt = account.type === 'debt'
  const displayBalance = isDebt ? -Math.abs(account.balance) : account.balance

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        onClick && "hover:scale-105"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium truncate">{account.name}</CardTitle>
        <div className={cn("p-2 rounded-full", colorClass)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className={cn(
            "text-2xl font-bold",
            isDebt ? "text-red-600" : account.balance >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {formatCurrency(displayBalance, account.currency)}
          </div>
          <p className="text-xs text-muted-foreground capitalize">
            {account.type} • {account.currency}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}