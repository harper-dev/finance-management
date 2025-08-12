import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Layout } from '../components/layout/Layout';
import { AccountForm } from '../components/forms/AccountForm';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function NewAccount() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaceStore();

  const handleSuccess = () => {
    navigate('/accounts');
  };

  const handleCancel = () => {
    navigate('/accounts');
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
              Back to Accounts
            </Button>
          </div>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No workspace selected. Please select a workspace before creating an account.
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
            Back to Accounts
          </Button>
        </div>

        {/* Form */}
        <AccountForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </Layout>
  );
}