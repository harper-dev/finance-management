import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { BudgetForm } from '@/components/forms/BudgetForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, DollarSign, Target } from 'lucide-react';

export default function NewBudget() {
  const navigate = useNavigate();
  const [showTips, setShowTips] = useState(true);

  const handleSuccess = () => {
    navigate('/budgets');
  };

  const handleCancel = () => {
    navigate('/budgets');
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/budgets')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Budgets
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <BudgetForm
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </div>

            {/* Tips and Information Section */}
            {showTips && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Budget Tips
                    </CardTitle>
                    <CardDescription>
                      Best practices for effective budgeting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                          <DollarSign className="h-3 w-3 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Be Realistic</h4>
                          <p className="text-sm text-gray-600">
                            Set budget amounts based on your actual spending patterns and income.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 rounded-full p-1 mt-0.5">
                          <Calendar className="h-3 w-3 text-green-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Start Monthly</h4>
                          <p className="text-sm text-gray-600">
                            Monthly budgets are easier to track and adjust as needed.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                          <Target className="h-3 w-3 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Focus on Big Categories</h4>
                          <p className="text-sm text-gray-600">
                            Start with your largest expense categories like food, transportation, and housing.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Common Budget Categories</CardTitle>
                    <CardDescription>
                      Popular categories to help you get started
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-700">Essential</div>
                        <ul className="space-y-1 text-gray-600">
                          <li>• Food & Dining</li>
                          <li>• Transportation</li>
                          <li>• Bills & Utilities</li>
                          <li>• Health & Medical</li>
                        </ul>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-700">Lifestyle</div>
                        <ul className="space-y-1 text-gray-600">
                          <li>• Entertainment</li>
                          <li>• Shopping</li>
                          <li>• Travel</li>
                          <li>• Personal Care</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Budget Periods</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="font-medium text-sm">Monthly</div>
                      <p className="text-xs text-gray-600">
                        Best for regular expenses like groceries, utilities, and entertainment
                      </p>
                    </div>
                    <div>
                      <div className="font-medium text-sm">Quarterly</div>
                      <p className="text-xs text-gray-600">
                        Good for seasonal expenses like clothing or maintenance
                      </p>
                    </div>
                    <div>
                      <div className="font-medium text-sm">Yearly</div>
                      <p className="text-xs text-gray-600">
                        Perfect for annual expenses like insurance, taxes, or vacations
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTips(false)}
                  className="w-full"
                >
                  Hide Tips
                </Button>
              </div>
            )}

            {!showTips && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTips(true)}
                >
                  Show Budget Tips
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}