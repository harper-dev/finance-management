import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/services/api';
import { useWorkspaceStore } from '@/stores/workspaceStore';

const workspaceFormSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').max(100, 'Name too long'),
  currency: z.string().min(1, 'Currency is required'),
  description: z.string().optional(),
});

type WorkspaceFormData = z.infer<typeof workspaceFormSchema>;

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar (USD)', symbol: '$' },
  { value: 'EUR', label: 'Euro (EUR)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (GBP)', symbol: '£' },
  { value: 'CNY', label: 'Chinese Yuan (CNY)', symbol: '¥' },
  { value: 'JPY', label: 'Japanese Yen (JPY)', symbol: '¥' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar (AUD)', symbol: 'A$' },
];

export default function NewWorkspace() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setCurrentWorkspace } = useWorkspaceStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      currency: 'USD',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: WorkspaceFormData) => {
      const payload = {
        name: data.name,
        currency: data.currency,
        description: data.description || undefined,
      };

      // Note: This endpoint might not exist yet in the API
      return (apiClient as any).createWorkspace(payload);
    },
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setCurrentWorkspace(newWorkspace);
      navigate('/dashboard');
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const selectedCurrency = CURRENCIES.find(c => c.value === watch('currency'));

  return (
    <Layout>
      <div className="p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Create New Workspace
              </CardTitle>
              <CardDescription>
                Set up a new workspace to organize your finances
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {mutation.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {mutation.error instanceof Error 
                      ? mutation.error.message 
                      : 'Failed to create workspace. Please try again.'
                    }
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={onSubmit} className="space-y-6">
                {/* Workspace Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Workspace Name *</Label>
                  <Input
                    id="name"
                    placeholder="My Personal Finances"
                    {...register('name')}
                    error={errors.name?.message}
                  />
                  <p className="text-sm text-muted-foreground">
                    Choose a name that helps you identify this workspace
                  </p>
                </div>

                {/* Default Currency */}
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency *</Label>
                  <Select 
                    value={watch('currency')}
                    onValueChange={(value) => setValue('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          <div className="flex items-center gap-2">
                            <span>{currency.symbol}</span>
                            <span>{currency.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.currency && (
                    <p className="text-sm text-red-600">{errors.currency.message}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    This will be used for all monetary values in this workspace
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="Add notes about this workspace..."
                    {...register('description')}
                  />
                </div>

                {/* Currency Preview */}
                {selectedCurrency && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Preview</h4>
                    <div className="text-sm text-blue-700">
                      <p>Currency symbol: <span className="font-mono font-bold">{selectedCurrency.symbol}</span></p>
                      <p>Example amount: <span className="font-mono">{selectedCurrency.symbol}1,234.56</span></p>
                    </div>
                  </div>
                )}

                {/* Workspace Benefits */}
                <Card className="bg-gray-50 border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">What you'll get:</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <span>Separate accounts and transactions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <span>Individual budgets and savings goals</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <span>Customized analytics and reports</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <span>Independent settings and preferences</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Form Actions */}
                <div className="flex gap-3 pt-6">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Workspace
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              You can create multiple workspaces to separate different financial scenarios,
              such as personal and business finances.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}