import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import Layout from '../components/layout/Layout';
import { AccountForm } from '../components/forms/AccountForm';

export default function NewAccount() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/accounts');
  };

  const handleCancel = () => {
    navigate('/accounts');
  };

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