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
  Target, 
  TrendingUp, 
  CheckCircle,
  DollarSign,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { SavingsGoal } from '../../types/api';
import { apiClient } from '../../services/api';
import { useWorkspaceStore } from '../../stores/workspaceStore';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onEdit?: (goal: SavingsGoal) => void;
  onAddMoney?: (goal: SavingsGoal) => void;
  showActions?: boolean;
}

// Simple progress component
function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

export function SavingsGoalCard({ goal, onEdit, onAddMoney, showActions = true }: SavingsGoalCardProps) {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspaceStore();

  const currentAmount = goal.current_amount || 0;
  const targetAmount = goal.target_amount;
  const progressPercentage = (currentAmount / targetAmount) * 100;
  const remaining = Math.max(0, targetAmount - currentAmount);
  const isCompleted = currentAmount >= targetAmount;
  
  const currency = currentWorkspace?.currency || 'USD';
  const currencySymbol = currency === 'USD' ? '$' : currency === 'CNY' ? '¥' : currency;

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.deleteSavingsGoal(goal.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
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

  const getDaysRemaining = () => {
    if (!goal.target_date) return null;
    
    const targetDate = new Date(goal.target_date);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getMonthlySavingsNeeded = () => {
    if (!goal.target_date || isCompleted) return null;
    
    const targetDate = new Date(goal.target_date);
    const today = new Date();
    const monthsRemaining = Math.max(1, 
      (targetDate.getFullYear() - today.getFullYear()) * 12 + 
      (targetDate.getMonth() - today.getMonth())
    );
    
    return remaining / monthsRemaining;
  };

  const daysRemaining = getDaysRemaining();
  const monthlySavingsNeeded = getMonthlySavingsNeeded();

  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (progressPercentage >= 75) return <TrendingUp className="h-4 w-4 text-blue-600" />;
    return <Target className="h-4 w-4 text-gray-600" />;
  };

  const getProgressColor = () => {
    if (isCompleted) return 'bg-green-600';
    if (progressPercentage >= 75) return 'bg-blue-600';
    if (progressPercentage >= 50) return 'bg-yellow-600';
    return 'bg-gray-400';
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the goal "${goal.name}"?`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <Card className={`relative ${isCompleted ? 'border-green-200 bg-green-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {goal.name}
              {getStatusIcon()}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {goal.category && (
                <Badge variant="outline" className="text-xs">
                  {goal.category}
                </Badge>
              )}
              <Badge 
                variant={goal.is_active ? 'default' : 'secondary'} 
                className="text-xs"
              >
                {goal.is_active ? 'Active' : 'Inactive'}
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
                <DropdownMenuItem onClick={() => onAddMoney?.(goal)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Money
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(goal)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Goal
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Goal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Target Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">Target Amount</span>
          </div>
          <span className="font-semibold">
            {currencySymbol}{formatAmount(targetAmount)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className={isCompleted ? 'text-green-600 font-medium' : ''}>
              {currencySymbol}{formatAmount(currentAmount)} / {currencySymbol}{formatAmount(targetAmount)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{progressPercentage.toFixed(1)}% complete</span>
            <span className={isCompleted ? 'text-green-600' : ''}>
              {isCompleted ? 'Goal Achieved!' : `Remaining: ${currencySymbol}${formatAmount(remaining)}`}
            </span>
          </div>
        </div>

        {/* Success Message */}
        {isCompleted && (
          <Alert className="py-2 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-800">
              Congratulations! You've reached your savings goal!
            </AlertDescription>
          </Alert>
        )}

        {/* Monthly Savings Needed */}
        {monthlySavingsNeeded && monthlySavingsNeeded > 0 && (
          <Alert className="py-2 border-blue-200 bg-blue-50">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              Save {currencySymbol}{formatAmount(monthlySavingsNeeded)} monthly to reach your goal on time.
            </AlertDescription>
          </Alert>
        )}

        {/* Target Date */}
        {goal.target_date && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Target: {formatDate(goal.target_date)}</span>
            {daysRemaining !== null && (
              <Badge 
                variant={daysRemaining < 30 ? 'destructive' : 'secondary'} 
                className="text-xs ml-2"
              >
                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
              </Badge>
            )}
          </div>
        )}

        {/* Description */}
        {goal.description && (
          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            {goal.description}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddMoney?.(goal)}
            disabled={isCompleted}
            className="flex-1"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Money
          </Button>
          {showActions && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit?.(goal)}
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}