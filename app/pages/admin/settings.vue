<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const notifications = useNotifications()

const settings = reactive({
  general: {
    siteName: 'EventHub',
    siteDescription: 'Enterprise Event Management Platform',
    supportEmail: 'support@eventhub.com',
    timezone: 'America/New_York'
  },
  features: {
    allowRegistrations: true,
    requireEmailVerification: true,
    enablePayments: true,
    allowOrganizerSignups: true
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false
  }
})

const saving = ref(false)

async function saveSettings() {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    notifications.success('Settings saved successfully')
  }
  catch {
    notifications.error('Failed to save settings')
  }
  finally {
    saving.value = false
  }
}

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' }
]
</script>

<template>
  <div>
    <PageHeader
      title="Settings"
      description="Configure platform settings and preferences"
    />

    <div class="space-y-8">
      <!-- General Settings -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950">
              <UIcon
                name="i-lucide-settings"
                class="h-5 w-5 text-primary-600"
              />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                General Settings
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Basic platform configuration
              </p>
            </div>
          </div>
        </template>

        <div class="grid gap-6 sm:grid-cols-2">
          <AppInput
            v-model="settings.general.siteName"
            label="Site Name"
            placeholder="EventHub"
          />

          <AppInput
            v-model="settings.general.supportEmail"
            label="Support Email"
            type="email"
            placeholder="support@eventhub.com"
          />

          <UFormField
            label="Default Timezone"
            class="sm:col-span-2"
            orientation="vertical"
            size="md"
          >
            <USelect
              v-model="settings.general.timezone"
              :items="timezones"
              value-key="value"
              label-key="label"
            />
          </UFormField>

          <UFormField
            label="Site Description"
            class="sm:col-span-2"
            orientation="vertical"
            size="md"
          >
            <UTextarea
              v-model="settings.general.siteDescription"
              placeholder="Enter site description"
              :rows="3"
            />
          </UFormField>
        </div>
      </UCard>

      <!-- Feature Toggles -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
              <UIcon
                name="i-lucide-toggle-right"
                class="h-5 w-5 text-emerald-600"
              />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Feature Toggles
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Enable or disable platform features
              </p>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <label class="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div>
              <span class="font-medium text-gray-900 dark:text-white">Allow Registrations</span>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Allow new users to register on the platform
              </p>
            </div>
            <USwitch v-model="settings.features.allowRegistrations" />
          </label>

          <label class="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div>
              <span class="font-medium text-gray-900 dark:text-white">Email Verification</span>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Require email verification for new accounts
              </p>
            </div>
            <USwitch v-model="settings.features.requireEmailVerification" />
          </label>

          <label class="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div>
              <span class="font-medium text-gray-900 dark:text-white">Enable Payments</span>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Allow paid events and ticket sales
              </p>
            </div>
            <USwitch v-model="settings.features.enablePayments" />
          </label>

          <label class="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div>
              <span class="font-medium text-gray-900 dark:text-white">Organizer Signups</span>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Allow users to sign up as event organizers
              </p>
            </div>
            <USwitch v-model="settings.features.allowOrganizerSignups" />
          </label>
        </div>
      </UCard>

      <!-- Notification Settings -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
              <UIcon
                name="i-lucide-bell"
                class="h-5 w-5 text-amber-600"
              />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Notification Settings
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Configure notification channels
              </p>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <label class="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div>
              <span class="font-medium text-gray-900 dark:text-white">Email Notifications</span>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Send notifications via email
              </p>
            </div>
            <USwitch v-model="settings.notifications.emailNotifications" />
          </label>

          <label class="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div>
              <span class="font-medium text-gray-900 dark:text-white">Push Notifications</span>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Send browser push notifications
              </p>
            </div>
            <USwitch v-model="settings.notifications.pushNotifications" />
          </label>

          <label class="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div>
              <span class="font-medium text-gray-900 dark:text-white">SMS Notifications</span>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Send notifications via SMS
              </p>
            </div>
            <USwitch v-model="settings.notifications.smsNotifications" />
          </label>
        </div>
      </UCard>

      <!-- Save Button -->
      <div class="flex justify-end">
        <UButton
          :loading="saving"
          size="lg"
          @click="saveSettings"
        >
          Save Settings
        </UButton>
      </div>
    </div>
  </div>
</template>
