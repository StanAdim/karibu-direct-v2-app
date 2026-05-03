<script setup lang="ts">
const openModel = defineModel<boolean>('open', { default: false })

const notifications = useNotifications()
const api = useApi()

const form = reactive({
  current_password: '',
  new_password: '',
  confirm_password: '',
})

const errors = reactive({
  current_password: '',
  new_password: '',
  confirm_password: '',
})

const submitting = ref(false)

function setModalVisibility(value: boolean): void {
  openModel.value = value
}

function clearForm(): void {
  form.current_password = ''
  form.new_password = ''
  form.confirm_password = ''
  errors.current_password = ''
  errors.new_password = ''
  errors.confirm_password = ''
}

watch(openModel, val => {
  if (!val)
    clearForm()
})

function validate(): boolean {
  errors.current_password = ''
  errors.new_password = ''
  errors.confirm_password = ''

  let ok = true
  if (!form.current_password.trim()) {
    errors.current_password = 'Current password is required'
    ok = false
  }

  if (!form.new_password) {
    errors.new_password = 'New password is required'
    ok = false
  }
  else if (form.new_password.length < 8) {
    errors.new_password = 'Use at least 8 characters'
    ok = false
  }
  else if (form.new_password === form.current_password && form.current_password) {
    errors.new_password = 'New password must differ from your current password'
    ok = false
  }

  if (!form.confirm_password) {
    errors.confirm_password = 'Confirm your new password'
    ok = false
  }
  else if (form.confirm_password !== form.new_password) {
    errors.confirm_password = 'Passwords do not match'
    ok = false
  }

  return ok
}

async function onSubmit(): Promise<void> {
  if (!validate() || submitting.value)
    return

  submitting.value = true
  try {
    const response = await api.post<{ success?: boolean; meta?: { message?: string } }>(
      '/auth/change-password',
      {
        current_password: form.current_password,
        new_password: form.new_password,
      },
    )
    const meta = typeof response === 'object' && response && 'meta' in response ? response.meta : undefined
    const message = meta?.message && typeof meta.message === 'string'
      ? meta.message
      : 'Password changed successfully'
    notifications.success({
      title: 'Password updated',
      description: message,
    })
    openModel.value = false
    clearForm()
  }
  catch {
    //
  }
  finally {
    submitting.value = false
  }
}

function onCancel(): void {
  openModel.value = false
}
</script>

<template>
  <AppModal
    :model-value="openModel"
    max-width="sm"
    align="top"
    @update:model-value="setModalVisibility"
  >
    <form class="space-y-5 pr-8" @submit.prevent="onSubmit">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Change password
        </h3>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter your current password, then choose a new one (at least 8 characters).
        </p>
      </div>

      <AppInput
        v-model="form.current_password"
        type="password"
        label="Current password"
        placeholder="••••••••"
        icon="i-lucide-lock"
        autocomplete="current-password"
        :error="errors.current_password"
        required
      />

      <AppInput
        v-model="form.new_password"
        type="password"
        label="New password"
        placeholder="••••••••"
        icon="i-lucide-lock-keyhole"
        autocomplete="new-password"
        :error="errors.new_password"
        required
      />

      <AppInput
        v-model="form.confirm_password"
        type="password"
        label="Confirm new password"
        placeholder="••••••••"
        icon="i-lucide-lock-keyhole"
        autocomplete="new-password"
        :error="errors.confirm_password"
        required
      />

      <div class="flex justify-end gap-3 pt-2">
        <AppButton color="neutral" type="button" @click="onCancel">
          Cancel
        </AppButton>
        <AppButton type="submit" :disabled="submitting">
          {{ submitting ? 'Updating…' : 'Update password' }}
        </AppButton>
      </div>
    </form>
  </AppModal>
</template>
