import { ArrowUpRight, ArrowDownRight, ArrowRightLeft } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Transaction } from '@/types/api'
import { cn } from '@/lib/utils'

interface TransactionItemProps {
  transaction: Transaction
  onClick?: () => void
}

export default function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return ArrowUpRight
      case 'expense':
        return ArrowDownRight
      case 'transfer':
        return ArrowRightLeft
      default:
        return ArrowRightLeft
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600 bg-green-100'
      case 'expense':
        return 'text-red-600 bg-red-100'
      case 'transfer':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600'
      case 'expense':
        return 'text-red-600'
      case 'transfer':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  const Icon = getTransactionIcon(transaction.type)
  const iconColor = getTransactionColor(transaction.type)
  const amountColor = getAmountColor(transaction.type)

  const displayAmount = transaction.type === 'expense' ? -transaction.amount : transaction.amount

  return (
    <div
      className={cn(
        "flex items-center space-x-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      {/* Transaction icon */}
      <div className={cn("p-2 rounded-full", iconColor)}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Transaction details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium truncate">
              {transaction.description || `${transaction.type} transaction`}
            </p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{transaction.accounts?.name}</span>
              {transaction.category && (
                <>
                  <span>•</span>
                  <span className="capitalize">{transaction.category}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className={cn("text-sm font-semibold", amountColor)}>
              {formatCurrency(displayAmount, transaction.currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(transaction.transaction_date)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}