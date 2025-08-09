import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    try {
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setIsSubmitted(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {isSubmitted ? 'Check Your Email' : 'Forgot Password'}
              </CardTitle>
              <CardDescription>
                {isSubmitted 
                  ? 'We\'ve sent a password reset link to your email address.'
                  : 'Enter your email address and we\'ll send you a link to reset your password.'
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isSubmitted ? (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-green-100 p-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <h3 className="font-semibold">Email Sent Successfully</h3>
                    <p className="text-sm text-muted-foreground">
                      We've sent a password reset link to <strong>{getValues('email')}</strong>.
                      Check your inbox and click the link to reset your password.
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex">
                        <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-blue-800">
                            Didn't receive the email?
                          </h4>
                          <div className="mt-2 text-sm text-blue-700">
                            <ul className="list-disc list-inside space-y-1">
                              <li>Check your spam or junk mail folder</li>
                              <li>Make sure {getValues('email')} is correct</li>
                              <li>Wait a few minutes for the email to arrive</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setIsSubmitted(false)}>
                      Try Different Email
                    </Button>
                    <Button asChild className="flex-1">
                      <Link to="/login">
                        Back to Login
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      {...register('email')}
                      error={errors.email?.message}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                  </Button>

                  <div className="text-center">
                    <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
                      Remember your password? Sign in
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-primary hover:underline">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}