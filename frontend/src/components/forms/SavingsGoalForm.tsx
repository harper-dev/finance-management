import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, AlertCircle, Target, DollarSign } from 'lucide-react';
import { apiClient } from '../../services/api';
import { SavingsGoal } from '../../types/api';
import { useWorkspaceStore } from '../../stores/workspaceStore';

const savingsGoalFormSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(100, 'Name too long'),
  target_amount: z.coerce.number().min(0.01, 'Target amount must be greater than 0'),
  current_amount: z.coerce.number().min(0, 'Current amount must be 0 or greater').optional(),
  target_date: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

type SavingsGoalFormData = z.infer<typeof savingsGoalFormSchema>;

interface SavingsGoalFormProps {
  goal?: SavingsGoal;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const GOAL_CATEGORIES = [
  'Emergency Fund',
  'Vacation',
  'Home Purchase',
  'Car Purchase',
  'Education',
  'Wedding',
  'Retirement',
  'Investment',
  'Healthcare',
  'Debt Payoff',
  'Technology',
  'Home Improvement',
  'Other',
];

export function SavingsGoalForm({ goal, onSuccess, onCancel }: SavingsGoalFormProps) {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspaceStore();
  const isEditing = Boolean(goal);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SavingsGoalFormData>({
    resolver: zodResolver(savingsGoalFormSchema),
    defaultValues: goal ? {
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      target_date: goal.target_date ? goal.target_date.split('T')[0] : '',
      category: goal.category || '',
      description: goal.description || '',
    } : {
      current_amount: 0,
    },
  });

  const watchTargetAmount = watch('target_amount');
  const watchCurrentAmount = watch('current_amount');
  const watchTargetDate = watch('target_date');

  // Calculate progress percentage
  const progressPercentage = watchTargetAmount && watchCurrentAmount 
    ? Math.min((watchCurrentAmount / watchTargetAmount) * 100, 100)
    : 0;

  // Calculate monthly savings needed if target date is set
  const getMonthlySavingsNeeded = () => {
    if (!watchTargetDate || !watchTargetAmount || !watchCurrentAmount) return null;
    
    const targetDate = new Date(watchTargetDate);
    const today = new Date();
    const monthsRemaining = Math.max(1, (targetDate.getFullYear() - today.getFullYear()) * 12 + 
                                    (targetDate.getMonth() - today.getMonth()));
    
    const remaining = Math.max(0, watchTargetAmount - watchCurrentAmount);
    return remaining / monthsRemaining;
  };

  const monthlySavingsNeeded = getMonthlySavingsNeeded();

  const mutation = useMutation({
    mutationFn: async (data: SavingsGoalFormData) => {
      if (!currentWorkspace) {
        throw new Error('No workspace selected');
      }

      const payload = {
        name: data.name,
        target_amount: data.target_amount,
        current_amount: data.current_amount || 0,
        target_date: data.target_date || undefined,
        category: data.category || undefined,
        description: data.description || undefined,
      };

      if (isEditing) {
        return apiClient.updateSavingsGoal(goal!.id, payload);
      } else {
        return apiClient.createSavingsGoal(currentWorkspace.id, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      onSuccess?.();
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  const currency = currentWorkspace?.currency || 'USD';
  const currencySymbol = currency === 'USD' ? '$' : currency === 'CNY' ? '¥' : currency;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {isEditing ? 'Edit Savings Goal' : 'Create New Savings Goal'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update your savings goal details' 
            : 'Set up a savings goal to track your progress towards a financial target'
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {mutation.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {mutation.error instanceof Error 
                ? mutation.error.message 
                : 'Failed to save goal. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Goal Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Emergency Fund, Dream Vacation"
              {...register('name')}
            />
          </div>

          {/* Target and Current Amount */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_amount">
                Target Amount ({currency}) *
              </Label>
              <Input
                id="target_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('target_amount')}
                error={errors.target_amount?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_amount">
                Current Amount ({currency})
              </Label>
              <Input
                id="current_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('current_amount')}
                error={errors.current_amount?.message}
              />
            </div>
          </div>

          {/* Progress Display */}
          {watchTargetAmount && watchTargetAmount > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Progress</span>
                <span className="text-sm text-blue-600">
                  {progressPercentage.toFixed(1)}% Complete
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-blue-700">
                <span>{currencySymbol}{(watchCurrentAmount || 0).toLocaleString()}</span>
                <span>{currencySymbol}{watchTargetAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Category and Target Date */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_date">Target Date</Label>
              <Input
                id="target_date"
                type="date"
                {...register('target_date')}
                error={errors.target_date?.message}
              />
            </div>
          </div>

          {/* Monthly Savings Calculation */}
          {monthlySavingsNeeded && monthlySavingsNeeded > 0 && (
            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertDescription>
                To reach your goal by {new Date(watchTargetDate!).toLocaleDateString()}, 
                you need to save approximately{' '}
                <span className="font-medium">
                  {currencySymbol}{monthlySavingsNeeded.toFixed(2)} per month
                </span>.
              </AlertDescription>
            </Alert>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add notes about your goal, motivation, or specific details..."
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update Goal' : 'Create Goal'}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}