type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationOptions {
  title: string
  description?: string
  duration?: number
}

interface UseNotificationsReturn {
  success: (options: NotificationOptions | string) => void
  error: (options: NotificationOptions | string) => void
  warning: (options: NotificationOptions | string) => void
  info: (options: NotificationOptions | string) => void
  notify: (type: NotificationType, options: NotificationOptions | string) => void
}

export function useNotifications(): UseNotificationsReturn {
  const toast = useToast()

  function normalizeOptions(options: NotificationOptions | string): NotificationOptions {
    if (typeof options === 'string') {
      return { title: options }
    }
    return options
  }

  function notify(type: NotificationType, options: NotificationOptions | string): void {
    const { title, description, duration = 5000 } = normalizeOptions(options)

    const colorMap: Record<NotificationType, string> = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info'
    }

    const iconMap: Record<NotificationType, string> = {
      success: 'i-lucide-check-circle',
      error: 'i-lucide-x-circle',
      warning: 'i-lucide-alert-triangle',
      info: 'i-lucide-info'
    }

    toast.add({
      title,
      description,
      color: colorMap[type],
      icon: iconMap[type],
      timeout: duration
    })
  }

  function success(options: NotificationOptions | string): void {
    notify('success', options)
  }

  function error(options: NotificationOptions | string): void {
    notify('error', options)
  }

  function warning(options: NotificationOptions | string): void {
    notify('warning', options)
  }

  function info(options: NotificationOptions | string): void {
    notify('info', options)
  }

  return {
    success,
    error,
    warning,
    info,
    notify
  }
}
