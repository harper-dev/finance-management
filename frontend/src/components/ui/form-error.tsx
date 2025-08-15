import React from 'react'
import { AlertCircle, Info, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Consistent error display components for forms
 */

export interface FormErrorProps {
  error?: string | string[]
  className?: string
  variant?: 'error' | 'warning' | 'info' | 'success'
  showIcon?: boolean
}

/**
 * Display a single field error or list of errors
 */
export function FormError({ 
  error, 
  className, 
  variant = 'error',
  showIcon = true 
}: FormErrorProps) {
  if (!error) return null

  const errors = Array.isArray(error) ? error : [error]
  if (errors.length === 0) return null

  const getVariantStyles = () => {
    switch (variant) {
      case 'error':
        return 'text-destructive'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'info':
        return 'text-blue-600 dark:text-blue-400'
      case 'success':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-destructive'
    }
  }

  const getIcon = () => {
    switch (variant) {
      case 'error':
        return <AlertCircle className="h-4 w-4" />
      case 'warning':
        return <AlertCircle className="h-4 w-4" />
      case 'info':
        return <Info className="h-4 w-4" />
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {errors.map((errorMessage, index) => (
        <div
          key={index}
          className={cn(
            'flex items-start gap-2 text-sm',
            getVariantStyles()
          )}
        >
          {showIcon && (
            <span className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </span>
          )}
          <span>{errorMessage}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Display field validation status with loading state
 */
export interface FieldStatusProps {
  isValid?: boolean
  isValidating?: boolean
  error?: string | string[]
  className?: string
}

export function FieldStatus({ 
  isValid, 
  isValidating, 
  error, 
  className 
}: FieldStatusProps) {
  if (isValidating) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span>Checking...</span>
      </div>
    )
  }

  if (error) {
    return <FormError error={error} className={className} />
  }

  if (isValid) {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-green-600 dark:text-green-400', className)}>
        <CheckCircle className="h-4 w-4" />
        <span>Valid</span>
      </div>
    )
  }

  return null
}

/**
 * Form field wrapper with consistent error display
 */
export interface FormFieldProps {
  label: string
  error?: string | string[]
  isRequired?: boolean
  isValidating?: boolean
  isValid?: boolean
  children: React.ReactNode
  className?: string
  description?: string
}

export function FormField({
  label,
  error,
  isRequired,
  isValidating,
  isValid,
  children,
  className,
  description
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
        {isRequired && <span className="text-destructive ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {children}
      
      <FieldStatus 
        isValid={isValid && !error}
        isValidating={isValidating}
        error={error}
      />
    </div>
  )
}

/**
 * Form section with error summary
 */
export interface FormSectionProps {
  title?: string
  errors?: Record<string, string | string[]>
  children: React.ReactNode
  className?: string
}

export function FormSection({ 
  title, 
  errors, 
  children, 
  className 
}: FormSectionProps) {
  const hasErrors = errors && Object.keys(errors).length > 0

  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <h3 className="text-lg font-medium">{title}</h3>
      )}
      
      {hasErrors && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-destructive">
                Please fix the following errors:
              </h4>
              <ul className="text-sm text-destructive space-y-1">
                {Object.entries(errors).map(([field, error]) => {
                  const errorMessages = Array.isArray(error) ? error : [error]
                  return errorMessages.map((message, index) => (
                    <li key={`${field}-${index}`} className="flex items-start gap-2">
                      <span className="font-medium">{field}:</span>
                      <span>{message}</span>
                    </li>
                  ))
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {children}
    </div>
  )
}

/**
 * Currency input with validation feedback
 */
export interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  currency?: string
  error?: string | string[]
  isValidating?: boolean
  onValueChange?: (value: number | null) => void
}

export function CurrencyInput({
  currency = 'USD',
  error,
  isValidating,
  onValueChange,
  onChange,
  className,
  ...props
}: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Call original onChange if provided
    onChange?.(e)
    
    // Parse and call onValueChange if provided
    if (onValueChange) {
      const parsed = parseFloat(value)
      onValueChange(isNaN(parsed) ? null : parsed)
    }
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        {currency}
      </div>
      <input
        {...props}
        type="number"
        step="0.01"
        min="0"
        onChange={handleChange}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background pl-12 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
      />
      {isValidating && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      )}
    </div>
  )
}