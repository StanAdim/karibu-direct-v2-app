interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

interface UseConfirmDialogReturn {
  isOpen: Ref<boolean>
  options: Ref<ConfirmOptions | null>
  confirm: (opts: ConfirmOptions) => Promise<boolean>
  close: () => void
  handleConfirm: () => void
  handleCancel: () => void
}

export function useConfirmDialog(): UseConfirmDialogReturn {
  const isOpen = ref(false)
  const options = ref<ConfirmOptions | null>(null)
  let resolvePromise: ((value: boolean) => void) | null = null

  function confirm(opts: ConfirmOptions): Promise<boolean> {
    options.value = {
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant: 'danger',
      ...opts
    }
    isOpen.value = true

    return new Promise<boolean>((resolve) => {
      resolvePromise = resolve
    })
  }

  function handleConfirm(): void {
    isOpen.value = false
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
    options.value = null
  }

  function handleCancel(): void {
    isOpen.value = false
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
    options.value = null
  }

  function close(): void {
    handleCancel()
  }

  return {
    isOpen,
    options,
    confirm,
    close,
    handleConfirm,
    handleCancel
  }
}
