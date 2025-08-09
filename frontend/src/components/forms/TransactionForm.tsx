import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Loader2, AlertCircle, CalendarIcon, ArrowUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { api } from '../../services/api';
import { Transaction, TransactionType } from '../../types/api';

const transactionFormSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer'] as const),
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  account_id: z.string().uuid('Account is required'),
  to_account_id: z.string().uuid().optional(),
  category: z.string().max(50, 'Category name too long').optional(),
  date: z.date(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  transaction?: Transaction;
  defaultAccountId?: string;
  defaultType?: TransactionType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TRANSACTION_TYPES: { value: TransactionType; label: string; color: string }[] = [
  { value: 'income', label: 'Income', color: 'bg-green-500' },
  { value: 'expense', label: 'Expense', color: 'bg-red-500' },
  { value: 'transfer', label: 'Transfer', color: 'bg-blue-500' },
];

const COMMON_CATEGORIES = {
  income: [
    'Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Bonus', 'Other Income'
  ],
  expense: [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities',
    'Healthcare', 'Education', 'Travel', 'Insurance', 'Groceries', 'Gas', 'Other Expense'
  ],
  transfer: [
    'Account Transfer', 'Savings', 'Investment Transfer', 'Payment', 'Other Transfer'
  ]
};

export function TransactionForm({ 
  transaction, 
  defaultAccountId, 
  defaultType = 'expense',
  onSuccess, 
  onCancel 
}: TransactionFormProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(transaction);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: transaction ? {
      type: transaction.type,
      amount: Math.abs(transaction.amount),
      description: transaction.description || '',
      account_id: transaction.account_id,
      to_account_id: transaction.to_account_id || undefined,
      category: transaction.category || '',
      date: new Date(transaction.transaction_date),
      notes: transaction.notes || '',
    } : {
      type: defaultType,
      account_id: defaultAccountId,
      date: new Date(),
      amount: 0,
    },
  });

  const watchType = watch('type');
  const watchAccountId = watch('account_id');

  // Fetch accounts for selection
  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: api.getAccounts,
  });

  const availableToAccounts = accounts.filter((account: any) => account.id !== watchAccountId);

  const mutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const payload = {
        type: data.type,
        amount: data.amount,
        description: data.description,
        account_id: data.account_id,
        to_account_id: data.to_account_id,
        category: data.category,
        date: format(data.date, 'yyyy-MM-dd'),
        notes: data.notes,
      };

      if (isEditing) {
        return api.updateTransaction(transaction!.id, payload);
      } else {
        return api.createTransaction(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      onSuccess?.();
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  const currentTypeConfig = TRANSACTION_TYPES.find(t => t.value === watchType);
  const currentCategories = COMMON_CATEGORIES[watchType] || [];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {currentTypeConfig && (
            <div className={cn("w-3 h-3 rounded-full", currentTypeConfig.color)} />
          )}
          {isEditing ? 'Edit Transaction' : 'New Transaction'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update your transaction details'
            : 'Record a new financial transaction'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Transaction Type *</Label>
            <div className="flex gap-2">
              {TRANSACTION_TYPES.map(({ value, label, color }) => (
                <Button
                  key={value}
                  type="button"
                  variant={watchType === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValue('type', value)}
                  className="flex items-center gap-2"
                >
                  <div className={cn("w-2 h-2 rounded-full", color)} />
                  {label}
                </Button>
              ))}
            </div>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Amount and Description Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                {...register('amount')}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="e.g. Lunch at restaurant"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Account Selection */}
          <div className="space-y-2">
            <Label>
              {watchType === 'transfer' ? 'From Account *' : 'Account *'}
            </Label>
            <Select 
              value={watchAccountId} 
              onValueChange={(value) => setValue('account_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account: any) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{account.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {account.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ) as any)}
              </SelectContent>
            </Select>
            {errors.account_id && (
              <p className="text-sm text-destructive">{errors.account_id.message}</p>
            )}
          </div>

          {/* To Account (for transfers) */}
          {watchType === 'transfer' && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4" />
                To Account *
              </Label>
              <Select onValueChange={(value) => setValue('to_account_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent>
                  {availableToAccounts.map((account: any) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{account.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {account.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.to_account_id && (
                <p className="text-sm text-destructive">{errors.to_account_id.message}</p>
              )}
            </div>
          )}

          {/* Category and Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select or type category" />
                </SelectTrigger>
                <SelectContent>
                  {currentCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Allow custom category input */}
              <Input
                placeholder="Or enter custom category"
                {...register('category')}
              />
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional additional notes"
              rows={3}
              {...register('notes')}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          {/* Error Display */}
          {mutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {mutation.error instanceof Error 
                  ? mutation.error.message 
                  : 'An error occurred while saving the transaction'
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {(isSubmitting || mutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? 'Update Transaction' : 'Create Transaction'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}