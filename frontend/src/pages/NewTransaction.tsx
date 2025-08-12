import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Layout } from '../components/layout/Layout';
import { TransactionForm } from '../components/forms/TransactionForm';
import { TransactionType } from '../types/api';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function NewTransaction() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentWorkspace } = useWorkspaceStore();

  const accountId = searchParams.get('accountId') || undefined;
  const type = (searchParams.get('type') as TransactionType) || 'expense';

  const handleSuccess = () => {
    navigate('/transactions');
  };

  const handleCancel = () => {
    navigate('/transactions');
  };

  if (!currentWorkspace) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Transactions
            </Button>
          </div>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No workspace selected. Please select a workspace before creating a transaction.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Transactions
          </Button>
        </div>

        {/* Form */}
        <TransactionForm
          defaultAccountId={accountId}
          defaultType={type}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </Layout>
  );
}