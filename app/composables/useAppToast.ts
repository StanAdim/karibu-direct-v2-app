import { computed } from 'vue'

type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  title?: string
  description?: string
  type?: ToastType
  duration?: number
}

interface ToastState {
  toasts: Toast[]
}

const DEFAULT_DURATION = 3000
const MAX_TOASTS = 5

function getToastState() {
  return useState<ToastState>('toast-state', () => ({
    toasts: []
  }))
}

export function useAppToast() {
  const state = getToastState()

  const toasts = computed(() => state.value.toasts)

  function remove(id: string) {
    state.value.toasts = state.value.toasts.filter(t => t.id !== id)
  }

  function add(toast: Omit<Toast, 'id'> & { id?: string }) {
    const id = toast.id ?? crypto.randomUUID()
    const duration = toast.duration ?? DEFAULT_DURATION

    const newToast: Toast = {
      id,
      title: toast.title,
      description: toast.description,
      type: toast.type ?? 'info',
      duration
    }

    state.value.toasts = [
      newToast,
      ...state.value.toasts
    ].slice(0, MAX_TOASTS)

    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }

    return id
  }

  return {
    toasts,
    add,
    remove
  }
}
