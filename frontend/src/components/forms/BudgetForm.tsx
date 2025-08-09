import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, AlertCircle, Calendar } from 'lucide-react';
import { apiClient } from '../../services/api';
import { Budget } from '../../types/api';
import { useWorkspaceStore } from '../../stores/workspaceStore';

const budgetFormSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(100, 'Name too long'),
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  period: z.enum(['monthly', 'quarterly', 'yearly'] as const),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
});

type BudgetFormData = z.infer<typeof budgetFormSchema>;

interface BudgetFormProps {
  budget?: Budget;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BUDGET_PERIODS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const COMMON_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Health & Medical',
  'Travel',
  'Education',
  'Business',
  'Personal Care',
  'Gifts & Donations',
  'Other',
];

export function BudgetForm({ budget, onSuccess, onCancel }: BudgetFormProps) {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspaceStore();
  const isEditing = Boolean(budget);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: budget ? {
      name: budget.name,
      category: budget.category,
      amount: budget.amount,
      period: budget.period,
      start_date: budget.start_date.split('T')[0], // Convert to YYYY-MM-DD format
      end_date: budget.end_date ? budget.end_date.split('T')[0] : '',
    } : {
      period: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
    },
  });

  const watchPeriod = watch('period');
  const watchStartDate = watch('start_date');

  // Calculate end date based on period
  const calculateEndDate = (startDate: string, period: string) => {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    let end = new Date(start);
    
    switch (period) {
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        end.setDate(end.getDate() - 1);
        break;
      case 'quarterly':
        end.setMonth(end.getMonth() + 3);
        end.setDate(end.getDate() - 1);
        break;
      case 'yearly':
        end.setFullYear(end.getFullYear() + 1);
        end.setDate(end.getDate() - 1);
        break;
    }
    
    return end.toISOString().split('T')[0];
  };

  // Auto-calculate end date when period or start date changes
  React.useEffect(() => {
    if (watchStartDate && watchPeriod) {
      const endDate = calculateEndDate(watchStartDate, watchPeriod);
      setValue('end_date', endDate);
    }
  }, [watchStartDate, watchPeriod, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      if (!currentWorkspace) {
        throw new Error('No workspace selected');
      }

      if (isEditing) {
        return apiClient.updateBudget(budget!.id, {
          name: data.name,
          category: data.category,
          amount: data.amount,
          period: data.period,
          start_date: data.start_date,
          end_date: data.end_date || undefined,
        });
      } else {
        return apiClient.createBudget(currentWorkspace.id, {
          name: data.name,
          category: data.category,
          amount: data.amount,
          period: data.period,
          start_date: data.start_date,
          end_date: data.end_date || undefined,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      onSuccess?.();
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {isEditing ? 'Edit Budget' : 'Create New Budget'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update your budget details' 
            : 'Set up a budget to track your spending in specific categories'
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
                : 'Failed to save budget. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Budget Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Budget Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Monthly Food Budget"
              {...register('name')}
              error={errors.name?.message}
            />
          </div>

          {/* Category and Amount */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Budget Amount ({currentWorkspace?.currency || 'USD'}) *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('amount')}
                error={errors.amount?.message}
              />
            </div>
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label htmlFor="period">Budget Period *</Label>
            <Select 
              onValueChange={(value) => setValue('period', value as any)}
              defaultValue={watchPeriod}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_PERIODS.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.period && (
              <p className="text-sm text-red-600">{errors.period.message}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date')}
                error={errors.start_date?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
                error={errors.end_date?.message}
                disabled // Auto-calculated based on period
              />
              <p className="text-sm text-gray-500">
                Automatically calculated based on period
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update Budget' : 'Create Budget'}
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