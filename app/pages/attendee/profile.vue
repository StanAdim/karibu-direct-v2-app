<script setup lang="ts">
definePageMeta({
  layout: 'attendee',
  middleware: 'attendee'
})

const { user } = useAuth()
const notifications = useNotifications()

const loading = ref(false)
const profile = reactive({
  firstName: user.value?.firstName || '',
  lastName: user.value?.lastName || '',
  email: user.value?.email || '',
  phone: user.value?.phone || '',
  avatar: user.value?.avatar || ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordErrors = reactive<Record<string, string>>({})

watch(user, (newUser) => {
  if (newUser) {
    profile.firstName = newUser.firstName
    profile.lastName = newUser.lastName
    profile.email = newUser.email
    profile.phone = newUser.phone || ''
    profile.avatar = newUser.avatar || ''
  }
}, { immediate: true })

async function saveProfile() {
  loading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    notifications.success('Profile updated successfully')
  }
  catch {
    notifications.error('Failed to update profile')
  }
  finally {
    loading.value = false
  }
}

function validatePasswordForm(): boolean {
  const errors: Record<string, string> = {}

  if (!passwordForm.currentPassword) {
    errors.currentPassword = 'Current password is required'
  }

  if (!passwordForm.newPassword) {
    errors.newPassword = 'New password is required'
  }
  else if (passwordForm.newPassword.length < 8) {
    errors.newPassword = 'Password must be at least 8 characters'
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  Object.assign(passwordErrors, errors)
  Object.keys(passwordErrors).forEach((key) => {
    if (!errors[key]) {
      delete passwordErrors[key]
    }
  })

  return Object.keys(errors).length === 0
}

async function changePassword() {
  if (!validatePasswordForm()) return

  loading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    notifications.success('Password changed successfully')
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  }
  catch {
    notifications.error('Failed to change password')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="My Profile"
      description="Manage your account settings and preferences"
    />

    <div class="space-y-8">
      <!-- Profile Information -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950">
              <UIcon
                name="i-lucide-user"
                class="h-5 w-5 text-primary-600"
              />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Update your personal details
              </p>
            </div>
          </div>
        </template>

        <form
          class="space-y-6"
          @submit.prevent="saveProfile"
        >
          <!-- Avatar -->
          <div class="flex items-center gap-6">
            <UAvatar
              :src="profile.avatar"
              :alt="`${profile.firstName} ${profile.lastName}`"
              size="xl"
            />
            <div>
              <UButton
                variant="outline"
                size="sm"
              >
                Change Avatar
              </UButton>
              <p class="mt-1 text-xs text-gray-500">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>

          <div class="grid gap-6 sm:grid-cols-2">
            <AppInput
              v-model="profile.firstName"
              label="First Name"
              placeholder="John"
              required
            />

            <AppInput
              v-model="profile.lastName"
              label="Last Name"
              placeholder="Doe"
              required
            />

            <AppInput
              v-model="profile.email"
              label="Email"
              type="email"
              placeholder="john@example.com"
              required
              disabled
            />

            <AppInput
              v-model="profile.phone"
              label="Phone Number"
              type="tel"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div class="flex justify-end">
            <UButton
              type="submit"
              :loading="loading"
            >
              Save Changes
            </UButton>
          </div>
        </form>
      </UCard>

      <!-- Change Password -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
              <UIcon
                name="i-lucide-lock"
                class="h-5 w-5 text-amber-600"
              />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Change Password
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Update your password to keep your account secure
              </p>
            </div>
          </div>
        </template>

        <form
          class="space-y-6"
          @submit.prevent="changePassword"
        >
          <AppInput
            v-model="passwordForm.currentPassword"
            type="password"
            label="Current Password"
            placeholder="Enter current password"
            :error="passwordErrors.currentPassword"
          />

          <div class="grid gap-6 sm:grid-cols-2">
            <AppInput
              v-model="passwordForm.newPassword"
              type="password"
              label="New Password"
              placeholder="Enter new password"
              :error="passwordErrors.newPassword"
            />

            <AppInput
              v-model="passwordForm.confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Confirm new password"
              :error="passwordErrors.confirmPassword"
            />
          </div>

          <div class="flex justify-end">
            <UButton
              type="submit"
              :loading="loading"
            >
              Change Password
            </UButton>
          </div>
        </form>
      </UCard>

      <!-- Notification Preferences -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950">
              <UIcon
                name="i-lucide-bell"
                class="h-5 w-5 text-sky-600"
              />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Notification Preferences
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Choose what notifications you want to receive
              </p>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <label class="flex items-center justify-between">
            <div>
              <span class="font-medium text-gray-900 dark:text-white">Email Notifications</span>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Receive emails about your events and tickets
              </p>
            </div>
            <USwitch :model-value="true" />
          </label>

          <label class="flex items-center justify-between">
            <div>
              <span class="font-medium text-gray-900 dark:text-white">Event Reminders</span>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Get reminded before events you're attending
              </p>
            </div>
            <USwitch :model-value="true" />
          </label>

          <label class="flex items-center justify-between">
            <div>
              <span class="font-medium text-gray-900 dark:text-white">Marketing Emails</span>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Receive updates about new events and features
              </p>
            </div>
            <USwitch :model-value="false" />
          </label>
        </div>
      </UCard>
    </div>
  </div>
</template>
