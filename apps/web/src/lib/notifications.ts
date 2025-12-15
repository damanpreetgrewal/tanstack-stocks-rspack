import { toast } from 'sonner'

export interface NotificationOptions {
  duration?: number
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
}

/**
 * Notification system using Sonner toast library
 */
export const notify = {
  success: (message: string, options?: NotificationOptions) => {
    toast.success(message, {
      duration: 3000,
      ...options,
    })
  },

  error: (message: string, options?: NotificationOptions) => {
    toast.error(message, {
      duration: 4000,
      ...options,
    })
  },

  info: (message: string, options?: NotificationOptions) => {
    toast.info(message, {
      duration: 3000,
      ...options,
    })
  },

  warning: (message: string, options?: NotificationOptions) => {
    toast.warning(message, {
      duration: 3000,
      ...options,
    })
  },

  loading: (message: string) => {
    return toast.loading(message)
  },

  dismiss: (id: string | number) => {
    toast.dismiss(id)
  },

  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: (data: T) => string
      error: (err: Error) => string
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    })
  },
}
