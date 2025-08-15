import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Loader2, AlertCircle, CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { api } from '../../services/api';
import { Transaction, TransactionType } from '../../types/api';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useFormWithValidation, useFormSubmission, useDuplicatePreventionValidation } from '../../hooks/useFormWithValidation';
import { formSchemas, validationUtils } from '../../utils/validation';
import { FormField, FormError, FormSection, CurrencyInput } from '../ui/form-error';

type TransactionFormData = {
  type: TransactionType;
  amount: number;
  description?: string;
  account_id: string;
  to_account_id?: string;
  category?: string;
  transaction_date: string;
};

interface EnhancedTransactionFormProps {
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

export function EnhancedTransactionForm({ 
  transaction, 
  defaultAccountId, 
  defaultType = 'expense',
  onSuccess, 
  onCancel 
}: EnhancedTransactionFormProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(transaction);
  const { currentWorkspace } = useWorkspaceStore();

  // Enhanced form with validation
  const form = useFormWithValidation(formSchemas.transactionForm as any, {
    mode: 'onChange',
    defaultValues: transaction ? {
      type: transaction.type,
      amount: Math.abs(transaction.amount),
      description: transaction.description || '',
      account_id: transaction.account_id,
      category: transaction.category || '',
      transaction_date: format(new Date(transaction.transaction_date), 'yyyy-MM-dd'),
    } : {
      type: defaultType,
      account_id: defaultAccountId || '',
      transaction_date: format(new Date(), 'yyyy-MM-dd'),
      amount: 0,
      description: '',
    },
  });

  // Duplicate prevention for similar transactions
  const { validateUnique, isDuplicate, isCheckingDuplicate } = useDuplicatePreventionValidation<TransactionFormData>(
    async (fieldName, value) => {
      if (fieldName === 'description' && currentWorkspace && value) {
        try {
          // Check for similar transactions in the last 7 days
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          
          const transactions = await api.getTransactions(currentWorkspace.id, {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            limit: 100,
          });
          
          return transactions.data.some(t => 
            t.description?.toLowerCase() === value.toLowerCase() &&
            Math.abs(t.amount) === form.watch('amount') &&
            t.account_id === form.watch('account_id') &&
            (isEditing ? t.id !== transaction?.id : true)
          );
        } catch {
          return false;
        }
      }
      return false;
    },
    1000 // 1 second debounce
  );

  // Fetch accounts for selection
  const { data: accountsResponse } = useQuery({
    queryKey: ['accounts', currentWorkspace?.id],
    queryFn: () => currentWorkspace ? api.getAccounts(currentWorkspace.id) : Promise.resolve([]),
    enabled: !!currentWorkspace,
  });

  const accounts = accountsResponse || [];

  // Form submission handler
  const { handleSubmit: handleFormSubmit, isSubmitting, submitError } = useFormSubmission<TransactionFormData>(
    async (data) => {
      if (!currentWorkspace) {
        throw new Error('No workspace selected');
      }

      // Get the account to get its currency
      const selectedAccount = accounts.find(acc => acc.id === data.account_id);
      if (!selectedAccount) {
        throw new Error('Selected account not found');
      }

      const payload = {
        workspace_id: currentWorkspace.id,
        type: data.type,
        amount: data.amount,
        currency: selectedAccount.currency,
        description: data.description || '',
        account_id: data.account_id,
        category: data.category,
        transaction_date: new Date(data.transaction_date).toISOString(),
      };

      if (isEditing) {
        return api.updateTransaction(transaction!.id, payload);
      } else {
        return api.createTransaction(payload);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ 
          queryKey: ['transactions', currentWorkspace?.id],
          exact: false 
        });
        queryClient.invalidateQueries({ queryKey: ['accounts', currentWorkspace?.id] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
        onSuccess?.();
      },
    }
  );

  // Watch form values
  const watchType = form.watch('type');
  const watchAccountId = form.watch('account_id');
  const watchAmount = form.watch('amount');
  const watchDescription = form.watch('description');

  // Validate for potential duplicates
  useEffect(() => {
    if (watchDescription && watchDescription.trim().length > 0 && watchAmount > 0) {
      validateUnique('description', watchDescription);
    }
  }, [watchDescription, watchAmount, watchAccountId, validateUnique]);

  // Get available accounts for transfer
  const availableToAccounts = accounts.filter(account => account.id !== watchAccountId);

  // Get selected account for currency display
  const selectedAccount = accounts.find(acc => acc.id === watchAccountId);

  const onSubmit = form.handleSubmit(async (data) => {
    // Final validation before submit
    const isFormValid = await form.validateForm();
    
    if (!isFormValid) {
      return;
    }
    
    // Show warning for potential duplicates but allow submission
    if (isDuplicate('description')) {
      const confirmed = window.confirm(
        'This transaction appears similar to a recent one. Are you sure you want to create it?'
      );
      if (!confirmed) {
        return;
      }
    }
    
    await handleFormSubmit(data as any);
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update your transaction details'
            : 'Record a new financial transaction'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FormSection 
          errors={form.formState.errors}
          className="space-y-6"
        >
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Transaction Type */}
            <FormField
              label="Transaction Type"
              isRequired
              error={form.getFieldError('type')}
              isValid={form.isFieldValid('type')}
              description="Select the type of transaction"
            >
              <Select onValueChange={(value) => form.setValue('type', value as TransactionType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_TYPES.map(({ value, label, color }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <div className={cn('w-3 h-3 rounded-full', color)} />
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Account Selection */}
            <FormField
              label="Account"
              isRequired
              error={form.getFieldError('account_id')}
              isValid={form.isFieldValid('account_id')}
              description="Select the account for this transaction"
            >
              <Select onValueChange={(value) => form.setValue('account_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{account.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {account.currency}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Amount */}
            <FormField
              label="Amount"
              isRequired
              error={form.getFieldError('amount')}
              isValid={form.isFieldValid('amount')}
              description="Enter the transaction amount"
            >
              <CurrencyInput
                currency={selectedAccount?.currency || 'USD'}
                placeholder="0.00"
                {...form.register('amount')}
                error={form.getFieldError('amount')}
              />
            </FormField>

            {/* Description */}
            <FormField
              label="Description"
              error={form.getFieldError('description')}
              isValidating={isCheckingDuplicate('description')}
              isValid={form.isFieldValid('description')}
              description="Brief description of the transaction"
            >
              <Input
                placeholder="e.g. Grocery shopping, Salary payment"
                {...form.register('description')}
              />
              {isDuplicate('description') && (
                <FormError 
                  error="Similar transaction found recently" 
                  variant="warning"
                />
              )}
            </FormField>

            {/* Category */}
            <FormField
              label="Category"
              error={form.getFieldError('category')}
              isValid={form.isFieldValid('category')}
              description="Optional category for better organization"
            >
              <Select onValueChange={(value) => form.setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_CATEGORIES[watchType]?.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Transaction Date */}
            <FormField
              label="Date"
              isRequired
              error={form.getFieldError('transaction_date')}
              isValid={form.isFieldValid('transaction_date')}
              description="When did this transaction occur?"
            >
              <Input
                type="date"
                {...form.register('transaction_date')}
              />
            </FormField>

            {/* Error Display */}
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {submitError}
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
              <Button 
                type="submit" 
                disabled={!form.formState.isValid}
                loading={isSubmitting}
                loadingText={isEditing ? 'Updating...' : 'Adding...'}
              >
                {isEditing ? 'Update Transaction' : 'Add Transaction'}
              </Button>
            </div>
          </form>
        </FormSection>
      </CardContent>
    </Card>
  );
}