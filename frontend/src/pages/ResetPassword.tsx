import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('password');

  useEffect(() => {
    // Check if we have the required parameters from the reset link
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      setIsValidToken(false);
      setError('Invalid or expired reset link. Please request a new password reset.');
      return;
    }

    // Set the session with the tokens from the URL
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    }).then(({ data, error }) => {
      if (error) {
        setIsValidToken(false);
        setError('Invalid or expired reset link. Please request a new password reset.');
      } else {
        setIsValidToken(true);
      }
    });
  }, [searchParams]);

  const onSubmit = async (data: ResetPasswordData) => {
    try {
      setError(null);

      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) {
        setError(error.message);
        return;
      }

      setIsSuccess(true);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login', { 
          replace: true,
          state: { message: 'Password updated successfully. Please sign in with your new password.' }
        });
      }, 3000);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  // Show loading while checking token validity
  if (isValidToken === null) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Validating reset link...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error if token is invalid
  if (isValidToken === false) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Invalid Reset Link</CardTitle>
                <CardDescription>
                  This password reset link is invalid or has expired.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => navigate('/forgot-password')}>
                    Request New Link
                  </Button>
                  <Button className="flex-1" onClick={() => navigate('/login')}>
                    Back to Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {isSuccess ? 'Password Updated!' : 'Set New Password'}
              </CardTitle>
              <CardDescription>
                {isSuccess 
                  ? 'Your password has been successfully updated.'
                  : 'Please enter your new password below.'
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isSuccess ? (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-green-100 p-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <h3 className="font-semibold">Password Updated Successfully</h3>
                    <p className="text-sm text-muted-foreground">
                      Your password has been updated. You will be redirected to the login page shortly.
                    </p>
                  </div>

                  <Button className="w-full" onClick={() => navigate('/login')}>
                    Continue to Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        {...register('password')}
                        error={errors.password?.message}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Password strength indicator */}
                    {password && (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">Password strength:</div>
                        <div className="flex space-x-1">
                          <div className={`h-1 w-full rounded ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`} />
                          <div className={`h-1 w-full rounded ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-200'}`} />
                          <div className={`h-1 w-full rounded ${/[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-200'}`} />
                          <div className={`h-1 w-full rounded ${/\d/.test(password) ? 'bg-green-500' : 'bg-gray-200'}`} />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Password must contain uppercase, lowercase, and number (min 8 chars)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your new password"
                        {...register('confirmPassword')}
                        error={errors.confirmPassword?.message}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Lock className="mr-2 h-4 w-4" />
                    Update Password
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}