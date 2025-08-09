import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { SavingsGoalForm } from '@/components/forms/SavingsGoalForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Target, DollarSign, Calendar, TrendingUp } from 'lucide-react';

export default function NewSavingsGoal() {
  const navigate = useNavigate();
  const [showTips, setShowTips] = useState(true);

  const handleSuccess = () => {
    navigate('/savings-goals');
  };

  const handleCancel = () => {
    navigate('/savings-goals');
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
              onClick={() => navigate('/savings-goals')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Savings Goals
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <SavingsGoalForm
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
                      Savings Tips
                    </CardTitle>
                    <CardDescription>
                      Best practices for achieving your savings goals
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-green-100 rounded-full p-1 mt-0.5">
                          <DollarSign className="h-3 w-3 text-green-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Start Small</h4>
                          <p className="text-sm text-gray-600">
                            Begin with a realistic target and gradually increase your savings amount.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                          <Calendar className="h-3 w-3 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Set Target Dates</h4>
                          <p className="text-sm text-gray-600">
                            Having a deadline helps you stay motivated and calculate monthly savings needed.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                          <TrendingUp className="h-3 w-3 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Automate Savings</h4>
                          <p className="text-sm text-gray-600">
                            Set up automatic transfers to your savings to make progress consistently.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Popular Savings Goals</CardTitle>
                    <CardDescription>
                      Common goals to inspire your savings journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-700">Essential</div>
                        <ul className="space-y-1 text-gray-600">
                          <li>• Emergency Fund</li>
                          <li>• Home Purchase</li>
                          <li>• Healthcare</li>
                          <li>• Education</li>
                        </ul>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-700">Lifestyle</div>
                        <ul className="space-y-1 text-gray-600">
                          <li>• Dream Vacation</li>
                          <li>• Car Purchase</li>
                          <li>• Wedding</li>
                          <li>• Technology</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Savings Strategies</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="font-medium text-sm">50/30/20 Rule</div>
                      <p className="text-xs text-gray-600">
                        Save 20% of your income: 15% for retirement, 5% for other goals
                      </p>
                    </div>
                    <div>
                      <div className="font-medium text-sm">Pay Yourself First</div>
                      <p className="text-xs text-gray-600">
                        Set aside money for savings before spending on other things
                      </p>
                    </div>
                    <div>
                      <div className="font-medium text-sm">Round-Up Method</div>
                      <p className="text-xs text-gray-600">
                        Round up purchases and save the extra change
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Emergency Fund Guide</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="font-medium text-sm">3-6 Months of Expenses</div>
                      <p className="text-xs text-gray-600">
                        A good emergency fund covers 3-6 months of your essential expenses
                      </p>
                    </div>
                    <div>
                      <div className="font-medium text-sm">Start with $1,000</div>
                      <p className="text-xs text-gray-600">
                        Begin with a smaller goal of $1,000 for immediate peace of mind
                      </p>
                    </div>
                    <div>
                      <div className="font-medium text-sm">Keep it Accessible</div>
                      <p className="text-xs text-gray-600">
                        Store emergency funds in a high-yield savings account
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
                  Show Savings Tips
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}