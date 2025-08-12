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
import { Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Account, AccountType } from '../../types/api';
import { useWorkspaceStore } from '../../stores/workspaceStore';

const accountFormSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(100, 'Name too long'),
  type: z.enum(['cash', 'bank', 'investment', 'asset', 'debt'] as const),
  currency: z.string().min(3, 'Currency code required').max(3, 'Invalid currency'),
  initial_balance: z.coerce.number().default(0),
  description: z.string().optional(),
});

type AccountFormData = z.infer<typeof accountFormSchema>;

interface AccountFormProps {
  account?: Account;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ACCOUNT_TYPES: { value: AccountType; label: string; description: string }[] = [
  { value: 'cash', label: 'Cash', description: 'Physical cash and cash equivalents' },
  { value: 'bank', label: 'Bank Account', description: 'Checking, savings, or other bank accounts' },
  { value: 'investment', label: 'Investment', description: 'Stocks, bonds, mutual funds, retirement accounts' },
  { value: 'asset', label: 'Asset', description: 'Real estate, vehicles, equipment, etc.' },
  { value: 'debt', label: 'Debt', description: 'Credit cards, loans, mortgages' },
];

const COMMON_CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
];

export function AccountForm({ account, onSuccess, onCancel }: AccountFormProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(account);
  const { currentWorkspace } = useWorkspaceStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: account ? {
      name: account.name,
      type: account.type,
      currency: account.currency,
      initial_balance: account.balance,
      description: account.description || '',
    } : {
      currency: 'USD',
      initial_balance: 0,
    },
  });

  const watchType = watch('type');

  const mutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      if (isEditing) {
        return api.updateAccount(account!.id, {
          name: data.name,
          description: data.description,
        });
      } else {
        if (!currentWorkspace) {
          throw new Error('No workspace selected');
        }
        return api.createAccount({
          workspace_id: currentWorkspace.id,
          name: data.name,
          type: data.type,
          currency: data.currency,
          initial_balance: data.initial_balance,
          description: data.description,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      onSuccess?.();
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Account' : 'Create New Account'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update your account information'
            : 'Add a new account to track your finances'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Account Name *</Label>
            <Input
              id="name"
              placeholder="e.g. Chase Checking, Emergency Fund"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Account Type (only for new accounts) */}
          {!isEditing && (
            <div className="space-y-2">
              <Label>Account Type *</Label>
              <Select onValueChange={(value) => setValue('type', value as AccountType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map(({ value, label, description }) => (
                    <SelectItem key={value} value={value}>
                      <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-muted-foreground">{description}</div>
                      </div>
                    </SelectItem>
                  ) as any)}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>
          )}

          {/* Currency (only for new accounts) */}
          {!isEditing && (
            <div className="space-y-2">
              <Label>Currency *</Label>
              <Select onValueChange={(value) => setValue('currency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_CURRENCIES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currency && (
                <p className="text-sm text-destructive">{errors.currency.message}</p>
              )}
            </div>
          )}

          {/* Initial Balance (only for new accounts) */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="initial_balance">
                {watchType === 'debt' ? 'Initial Debt Amount' : 'Initial Balance'}
              </Label>
              <Input
                id="initial_balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('initial_balance')}
              />
              {watchType === 'debt' && (
                <p className="text-sm text-muted-foreground">
                  Enter the amount you owe (will be displayed as negative balance)
                </p>
              )}
              {errors.initial_balance && (
                <p className="text-sm text-destructive">{errors.initial_balance.message}</p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional notes about this account"
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Error Display */}
          {mutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {mutation.error instanceof Error 
                  ? mutation.error.message 
                  : 'An error occurred while saving the account'
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
              {isEditing ? 'Update Account' : 'Create Account'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}