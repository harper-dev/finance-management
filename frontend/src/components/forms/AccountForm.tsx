import { useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Account, AccountType } from '../../types/api';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useFormWithValidation, useFormSubmission, useDuplicatePreventionValidation } from '../../hooks/useFormWithValidation';
import { formSchemas } from '../../utils/validation';
import { FormField, FormError, FormSection, CurrencyInput } from '../ui/form-error';

type AccountFormData = {
  name: string;
  type: AccountType;
  currency: string;
  initial_balance: number;
  description?: string;
};

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

  // Enhanced form with validation
  const form = useFormWithValidation(formSchemas.accountForm, {
    mode: 'onChange',
    defaultValues: account ? {
      name: account.name,
      type: account.type as any,
      currency: account.currency as any,
      initial_balance: account.balance,
      description: account.description || '',
    } : {
      currency: 'USD' as any,
      initial_balance: 0,
      type: 'bank' as any,
      name: '',
    },
  });

  // Duplicate prevention for account names
  const { validateUnique, isDuplicate, isCheckingDuplicate } = useDuplicatePreventionValidation<AccountFormData>(
    async (fieldName, value) => {
      if (fieldName === 'name' && currentWorkspace) {
        try {
          // Check if account name already exists in workspace
          const accounts = await api.getAccounts(currentWorkspace.id);
          const existingNames = accounts
            .filter(acc => isEditing ? acc.id !== account?.id : true)
            .map(acc => acc.name);
          return existingNames.some(name => name.toLowerCase() === value.toLowerCase());
        } catch {
          return false; // Allow if check fails
        }
      }
      return false;
    }
  );

  // Form submission handler
  const { handleSubmit: handleFormSubmit, isSubmitting, submitError } = useFormSubmission<AccountFormData>(
    async (data) => {
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
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        onSuccess?.();
      },
    }
  );

  // Watch form values
  const watchType = form.watch('type');
  const watchName = form.watch('name');

  // Validate unique name on change
  useEffect(() => {
    if (watchName && watchName.trim().length > 0) {
      validateUnique('name', watchName).then(isUnique => {
        if (!isUnique) {
          form.setFieldError('name', 'An account with this name already exists');
        } else {
          form.clearErrors('name');
        }
      });
    }
  }, [watchName, validateUnique, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    // Final validation before submit
    const isFormValid = await form.validateForm();
    const isNameUnique = !isDuplicate('name');
    
    if (!isFormValid || !isNameUnique) {
      return;
    }
    
    await handleFormSubmit(data as any);
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
        <FormSection 
          errors={form.formState.errors}
          className="space-y-6"
        >
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Account Name */}
            <FormField
              label="Account Name"
              isRequired
              error={form.getFieldError('name')}
              isValidating={isCheckingDuplicate('name')}
              isValid={form.isFieldValid('name') && !isDuplicate('name')}
              description="Choose a unique name for your account"
            >
              <Input
                placeholder="e.g. Chase Checking, Emergency Fund"
                {...form.register('name')}
              />
            </FormField>

            {/* Account Type (only for new accounts) */}
            {!isEditing && (
              <FormField
                label="Account Type"
                isRequired
                error={form.getFieldError('type')}
                isValid={form.isFieldValid('type')}
                description="Select the type of account you're adding"
              >
                <Select onValueChange={(value) => form.setValue('type', value as AccountType)}>
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
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            )}

            {/* Currency (only for new accounts) */}
            {!isEditing && (
              <FormField
                label="Currency"
                isRequired
                error={form.getFieldError('currency')}
                isValid={form.isFieldValid('currency')}
                description="Select the currency for this account"
              >
                <Select onValueChange={(value) => form.setValue('currency', value as any)}>
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
              </FormField>
            )}

            {/* Initial Balance (only for new accounts) */}
            {!isEditing && (
              <FormField
                label={watchType === 'debt' ? 'Initial Debt Amount' : 'Initial Balance'}
                error={form.getFieldError('initial_balance')}
                isValid={form.isFieldValid('initial_balance')}
                description={watchType === 'debt' 
                  ? 'Enter the amount you owe (will be displayed as negative balance)'
                  : 'Enter the current balance of this account'
                }
              >
                <CurrencyInput
                  currency={form.watch('currency') || 'USD'}
                  placeholder="0.00"
                  {...form.register('initial_balance')}
                  error={form.getFieldError('initial_balance')}
                />
              </FormField>
            )}

            {/* Description */}
            <FormField
              label="Description"
              error={form.getFieldError('description')}
              isValid={form.isFieldValid('description')}
              description="Optional notes about this account"
            >
              <Textarea
                placeholder="Optional notes about this account"
                rows={3}
                {...form.register('description')}
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
                disabled={!form.formState.isValid || isDuplicate('name')}
                loading={isSubmitting}
                loadingText={isEditing ? 'Updating...' : 'Creating...'}
              >
                {isEditing ? 'Update Account' : 'Create Account'}
              </Button>
            </div>
          </form>
        </FormSection>
      </CardContent>
    </Card>
  );
}