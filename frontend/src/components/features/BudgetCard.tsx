import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Budget } from '../../types/api';
import { apiClient } from '../../services/api';
import { useWorkspaceStore } from '../../stores/workspaceStore';

interface BudgetCardProps {
  budget: Budget;
  onEdit?: (budget: Budget) => void;
  showActions?: boolean;
}

// Simple progress component since we don't have one yet
function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

export function BudgetCard({ budget, onEdit, showActions = true }: BudgetCardProps) {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspaceStore();

  const spent = budget.spent || 0;
  const remaining = budget.remaining || budget.amount;
  const percentageUsed = budget.percentage_used || (spent / budget.amount) * 100;
  const isOverBudget = budget.is_over_budget || spent > budget.amount;
  const currency = currentWorkspace?.currency || 'USD';
  const currencySymbol = currency === 'USD' ? '$' : currency === 'CNY' ? '¥' : currency;

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.deleteBudget(budget.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'yearly': return 'Yearly';
      default: return period;
    }
  };

  const getStatusIcon = () => {
    if (isOverBudget) return <AlertTriangle className="h-4 w-4" />;
    if (percentageUsed >= 80) return <TrendingUp className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the budget "${budget.name}"?`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <Card className={`relative ${isOverBudget ? 'border-red-200 bg-red-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {budget.name}
              {getStatusIcon()}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Badge variant="outline" className="text-xs">
                {budget.category}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {getPeriodLabel(budget.period)}
              </Badge>
            </div>
          </div>
          
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(budget)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Budget
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Budget
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Budget Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">Budget Amount</span>
          </div>
          <span className="font-semibold">
            {currencySymbol}{formatAmount(budget.amount)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Spent</span>
            <span className={isOverBudget ? 'text-red-600 font-medium' : ''}>
              {currencySymbol}{formatAmount(spent)} / {currencySymbol}{formatAmount(budget.amount)}
            </span>
          </div>
          <Progress 
            value={Math.min(percentageUsed, 100)} 
            className={`h-2 ${isOverBudget ? 'bg-red-100' : ''}`}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{percentageUsed.toFixed(1)}% used</span>
            <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
              {remaining >= 0 ? 'Remaining: ' : 'Over by: '}
              {currencySymbol}{formatAmount(Math.abs(remaining))}
            </span>
          </div>
        </div>

        {/* Status Alert */}
        {isOverBudget && (
          <Alert variant="destructive" className="py-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              This budget is {currencySymbol}{formatAmount(Math.abs(remaining))} over the limit.
            </AlertDescription>
          </Alert>
        )}
        
        {!isOverBudget && percentageUsed >= 80 && (
          <Alert className="py-2 border-yellow-200 bg-yellow-50">
            <TrendingUp className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm text-yellow-800">
              You've used {percentageUsed.toFixed(1)}% of this budget.
            </AlertDescription>
          </Alert>
        )}

        {/* Date Range */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDate(budget.start_date)} - {budget.end_date ? formatDate(budget.end_date) : 'Ongoing'}
          </span>
        </div>

        {/* Active Status */}
        <div className="flex justify-between items-center pt-2 border-t">
          <Badge variant={budget.is_active ? 'default' : 'secondary'}>
            {budget.is_active ? 'Active' : 'Inactive'}
          </Badge>
          {budget.transactions && (
            <span className="text-xs text-gray-500">
              {budget.transactions.length} transaction{budget.transactions.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}