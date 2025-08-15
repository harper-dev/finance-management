import React from 'react'
import { Button, ButtonProps } from './button'
import { Spinner } from './spinner'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean
  loadingText?: string
  success?: boolean
  successText?: string
  error?: boolean
  errorText?: string
  showSuccessIcon?: boolean
  showErrorIcon?: boolean
  resetAfterSuccess?: number // milliseconds
  resetAfterError?: number // milliseconds
  onReset?: () => void
}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({
    loading = false,
    loadingText,
    success = false,
    successText,
    error = false,
    errorText,
    showSuccessIcon = true,
    showErrorIcon = true,
    resetAfterSuccess = 2000,
    resetAfterError = 3000,
    onReset,
    children,
    disabled,
    className,
    variant,
    ...props
  }, ref) => {
    const [internalSuccess, setInternalSuccess] = React.useState(false)
    const [internalError, setInternalError] = React.useState(false)

    // Handle success state
    React.useEffect(() => {
      if (success) {
        setInternalSuccess(true)
        if (resetAfterSuccess > 0) {
          const timer = setTimeout(() => {
            setInternalSuccess(false)
            onReset?.()
          }, resetAfterSuccess)
          return () => clearTimeout(timer)
        }
      }
    }, [success, resetAfterSuccess, onReset])

    // Handle error state
    React.useEffect(() => {
      if (error) {
        setInternalError(true)
        if (resetAfterError > 0) {
          const timer = setTimeout(() => {
            setInternalError(false)
            onReset?.()
          }, resetAfterError)
          return () => clearTimeout(timer)
        }
      }
    }, [error, resetAfterError, onReset])

    const isLoading = loading
    const isSuccess = success || internalSuccess
    const isError = error || internalError
    const isDisabled = disabled || isLoading || isSuccess

    const getVariant = () => {
      if (isSuccess) return 'default'
      if (isError) return 'destructive'
      return variant
    }

    const getContent = () => {
      if (isLoading) {
        return (
          <>
            <Spinner size="sm" className="mr-2" />
            {loadingText || children}
          </>
        )
      }

      if (isSuccess) {
        return (
          <>
            {showSuccessIcon && <CheckCircle className="mr-2 h-4 w-4" />}
            {successText || children}
          </>
        )
      }

      if (isError) {
        return (
          <>
            {showErrorIcon && <AlertCircle className="mr-2 h-4 w-4" />}
            {errorText || children}
          </>
        )
      }

      return children
    }

    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        variant={getVariant()}
        className={cn(
          isSuccess && "bg-green-600 hover:bg-green-700",
          className
        )}
        {...props}
      >
        {getContent()}
      </Button>
    )
  }
)

LoadingButton.displayName = "LoadingButton"