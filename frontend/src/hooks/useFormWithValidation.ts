import { useForm, UseFormProps, UseFormReturn, FieldValues, Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useCallback, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'

/**
 * Enhanced form validation hook with real-time validation and comprehensive error handling
 */

export interface ValidationOptions {
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all'
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit'
  shouldFocusError?: boolean
  delayError?: number
  criteriaMode?: 'firstError' | 'all'
}

export interface FormState<T extends FieldValues> {
  isValid: boolean
  isSubmitting: boolean
  isSubmitted: boolean
  isDirty: boolean
  isLoading: boolean
  errors: Record<string, string[]>
  touchedFields: Record<string, boolean>
  dirtyFields: Record<string, boolean>
  submitCount: number
}

export interface UseFormWithValidationReturn<T extends FieldValues> extends UseFormReturn<T> {
  formState: FormState<T>
  validateField: (fieldName: Path<T>) => Promise<boolean>
  validateForm: () => Promise<boolean>
  clearErrors: (fieldName?: Path<T>) => void
  setFieldError: (fieldName: Path<T>, error: string | string[]) => void
  resetForm: () => void
  isFieldValid: (fieldName: Path<T>) => boolean
  getFieldError: (fieldName: Path<T>) => string | undefined
  getFieldErrors: (fieldName: Path<T>) => string[]
  hasFieldError: (fieldName: Path<T>) => boolean
}

/**
 * Enhanced form hook with comprehensive validation features
 */
export function useFormWithValidation<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  options?: UseFormProps<T> & ValidationOptions
): UseFormWithValidationReturn<T> {
  const {
    mode = 'onChange',
    reValidateMode = 'onChange',
    shouldFocusError = true,
    delayError = 0,
    criteriaMode = 'firstError',
    ...formOptions
  } = options || {}

  const form = useForm<T>({
    resolver: zodResolver(schema),
    mode,
    reValidateMode,
    shouldFocusError,
    delayError,
    criteriaMode,
    ...formOptions,
  })

  const [customErrors, setCustomErrors] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Enhanced form state
  const formState: FormState<T> = {
    isValid: form.formState.isValid && Object.keys(customErrors).length === 0,
    isSubmitting: form.formState.isSubmitting,
    isSubmitted: form.formState.isSubmitted,
    isDirty: form.formState.isDirty,
    isLoading,
    errors: {
      ...formatFormErrors(form.formState.errors),
      ...customErrors,
    },
    touchedFields: form.formState.touchedFields,
    dirtyFields: form.formState.dirtyFields,
    submitCount: form.formState.submitCount,
  }

  // Validate individual field
  const validateField = useCallback(async (fieldName: Path<T>): Promise<boolean> => {
    const result = await form.trigger(fieldName)
    
    // Clear custom errors for this field if validation passes
    if (result) {
      setCustomErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
    
    return result
  }, [form])

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    const result = await form.trigger()
    
    // Clear all custom errors if form validation passes
    if (result) {
      setCustomErrors({})
    }
    
    return result && Object.keys(customErrors).length === 0
  }, [form, customErrors])

  // Clear errors
  const clearErrors = useCallback((fieldName?: Path<T>) => {
    if (fieldName) {
      form.clearErrors(fieldName)
      setCustomErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    } else {
      form.clearErrors()
      setCustomErrors({})
    }
  }, [form])

  // Set field error
  const setFieldError = useCallback((fieldName: Path<T>, error: string | string[]) => {
    const errors = Array.isArray(error) ? error : [error]
    setCustomErrors(prev => ({
      ...prev,
      [fieldName]: errors,
    }))
  }, [])

  // Reset form
  const resetForm = useCallback(() => {
    form.reset()
    setCustomErrors({})
    setIsLoading(false)
  }, [form])

  // Check if field is valid
  const isFieldValid = useCallback((fieldName: Path<T>): boolean => {
    return !form.formState.errors[fieldName] && !customErrors[fieldName]
  }, [form.formState.errors, customErrors])

  // Get single field error
  const getFieldError = useCallback((fieldName: Path<T>): string | undefined => {
    const formError = form.formState.errors[fieldName]
    const customError = customErrors[fieldName]
    
    if (customError && customError.length > 0) {
      return customError[0]
    }
    
    if (formError) {
      return formError.message || 'Invalid value'
    }
    
    return undefined
  }, [form.formState.errors, customErrors])

  // Get all field errors
  const getFieldErrors = useCallback((fieldName: Path<T>): string[] => {
    const formError = form.formState.errors[fieldName]
    const customError = customErrors[fieldName] || []
    
    const errors: string[] = [...customError]
    
    if (formError && formError.message) {
      errors.push(formError.message)
    }
    
    return errors
  }, [form.formState.errors, customErrors])

  // Check if field has error
  const hasFieldError = useCallback((fieldName: Path<T>): boolean => {
    return !!form.formState.errors[fieldName] || !!customErrors[fieldName]
  }, [form.formState.errors, customErrors])

  return {
    ...form,
    formState,
    validateField,
    validateForm,
    clearErrors,
    setFieldError,
    resetForm,
    isFieldValid,
    getFieldError,
    getFieldErrors,
    hasFieldError,
  }
}

/**
 * Format react-hook-form errors to match our error structure
 */
function formatFormErrors(errors: any): Record<string, string[]> {
  const formatted: Record<string, string[]> = {}
  
  for (const [field, error] of Object.entries(errors)) {
    if (error && typeof error === 'object' && 'message' in error) {
      formatted[field] = [(error as any).message]
    }
  }
  
  return formatted
}

/**
 * Hook for handling form submission with enhanced error handling and feedback
 */
export function useFormSubmission<T extends FieldValues, R = any>(
  onSubmit: (data: T) => Promise<R>,
  options?: {
    onSuccess?: (data: R) => void
    onError?: (error: Error) => void
    showSuccessMessage?: boolean
    successMessage?: string
    showErrorMessage?: boolean
    optimisticUpdate?: {
      queryKey: (string | number)[]
      updateFn: (oldData: any[], newItem: any) => any[]
      revertFn?: (oldData: any[], failedItem: any) => any[]
    }
  }
) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmit = useCallback(async (data: T) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      setSubmitSuccess(false)
      
      const result = await onSubmit(data)
      
      setSubmitSuccess(true)
      options?.onSuccess?.(result)
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setSubmitError(errorMessage)
      options?.onError?.(error instanceof Error ? error : new Error(errorMessage))
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [onSubmit, options])

  const resetSubmission = useCallback(() => {
    setSubmitError(null)
    setSubmitSuccess(false)
  }, [])

  return {
    handleSubmit,
    isSubmitting,
    submitError,
    submitSuccess,
    resetSubmission,
  }
}

/**
 * Hook for duplicate prevention logic
 */
export function useDuplicatePreventionValidation<T extends FieldValues>(
  checkDuplicate: (fieldName: keyof T, value: any) => Promise<boolean>,
  debounceMs: number = 500
) {
  const [duplicateChecks, setDuplicateChecks] = useState<Record<string, boolean>>({})
  const [checkingDuplicates, setCheckingDuplicates] = useState<Record<string, boolean>>({})

  const validateUnique = useCallback(async (fieldName: keyof T, value: any): Promise<boolean> => {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      return true // Empty values are handled by required validation
    }

    const fieldKey = String(fieldName)
    
    setCheckingDuplicates(prev => ({ ...prev, [fieldKey]: true }))
    
    try {
      // Debounce the check
      await new Promise(resolve => setTimeout(resolve, debounceMs))
      
      const isDuplicate = await checkDuplicate(fieldName, value)
      
      setDuplicateChecks(prev => ({ ...prev, [fieldKey]: isDuplicate }))
      
      return !isDuplicate
    } catch (error) {
      console.error('Error checking for duplicates:', error)
      return true // Allow submission if check fails
    } finally {
      setCheckingDuplicates(prev => ({ ...prev, [fieldKey]: false }))
    }
  }, [checkDuplicate, debounceMs])

  const isDuplicate = useCallback((fieldName: keyof T): boolean => {
    return duplicateChecks[String(fieldName)] || false
  }, [duplicateChecks])

  const isCheckingDuplicate = useCallback((fieldName: keyof T): boolean => {
    return checkingDuplicates[String(fieldName)] || false
  }, [checkingDuplicates])

  const clearDuplicateCheck = useCallback((fieldName: keyof T) => {
    const fieldKey = String(fieldName)
    setDuplicateChecks(prev => {
      const newChecks = { ...prev }
      delete newChecks[fieldKey]
      return newChecks
    })
    setCheckingDuplicates(prev => {
      const newChecking = { ...prev }
      delete newChecking[fieldKey]
      return newChecking
    })
  }, [])

  return {
    validateUnique,
    isDuplicate,
    isCheckingDuplicate,
    clearDuplicateCheck,
  }
}