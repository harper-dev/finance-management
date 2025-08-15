import React, { createContext, useContext } from 'react'
import { Toast } from './toast'
import { useToast, ToastMessage } from '../../hooks/useToast'

interface ToastContextType {
  toast: (message: Omit<ToastMessage, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToastContext = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { toasts, toast, success, error, warning, info, dismiss, dismissAll } = useToast()

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss, dismissAll }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
        {toasts.map((toastMessage) => (
          <Toast
            key={toastMessage.id}
            variant={toastMessage.variant}
            title={toastMessage.title}
            description={toastMessage.description}
            onClose={() => dismiss(toastMessage.id)}
            className="mb-2"
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}