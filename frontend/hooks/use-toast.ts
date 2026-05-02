'use client'

import { toast } from 'sonner'

export function useToast() {
  const showError = (message: string, error?: Error | unknown) => {
    console.error(message, error)
    toast.error(message, {
      description: error instanceof Error ? error.message : undefined,
      duration: 5000,
      dismissible: true,
    })
  }

  const showSuccess = (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
      dismissible: true,
    })
  }

  const showInfo = (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
      dismissible: true,
    })
  }

  const showWarning = (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 5000,
      dismissible: true,
    })
  }

  return {
    showError,
    showSuccess,
    showInfo,
    showWarning,
    toast,
  }
}
