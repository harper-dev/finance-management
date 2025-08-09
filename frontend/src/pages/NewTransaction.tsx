import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import Layout from '../components/layout/Layout';
import { TransactionForm } from '../components/forms/TransactionForm';
import { TransactionType } from '../types/api';

export default function NewTransaction() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const accountId = searchParams.get('accountId') || undefined;
  const type = (searchParams.get('type') as TransactionType) || 'expense';

  const handleSuccess = () => {
    navigate('/transactions');
  };

  const handleCancel = () => {
    navigate('/transactions');
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