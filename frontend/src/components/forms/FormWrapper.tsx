import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { LoadingOverlay } from '../ui/loading-overlay'
import { Toast } from '../ui/toast'
import { Button } from '../ui/button'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface FormWrapperProps {
  title: string
  description?: string
  isLoading?: boolean
  loadingMessage?: string
  isSubmitting?: boolean
  submitError?: string | null
  submitSuccess?: boolean
  successMessage?: string
  onRetry?: () => void
  onCancel?: () => void
  children: React.ReactNode
  className?: string
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  title,
  description,
  isLoading = false,
  loadingMessage = "Loading...",
  isSubmitting = false,
  submitError,
  submitSuccess = false,
  successMessage,
  onRetry,
  onCancel,
  children,
  className
}) => {
  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent>
        <LoadingOverlay isLoading={isLoading} message={loadingMessage}>
          {children}
          
          {/* Success Message */}
          {submitSuccess && successMessage && (
            <div className="mt-4">
              <Toast
                variant="success"
                title="Success!"
                description={successMessage}
              />
            </div>
          )}
          
          {/* Error Message with Retry */}
          {submitError && (
            <div className="mt-4">
              <Toast
                variant="destructive"
                title="Error"
                description={submitError}
                action={
                  onRetry && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRetry}
                      className="ml-2"
                    >
                      Retry
                    </Button>
                  )
                }
              />
            </div>
          )}
        </LoadingOverlay>
      </CardContent>
    </Card>
  )
}