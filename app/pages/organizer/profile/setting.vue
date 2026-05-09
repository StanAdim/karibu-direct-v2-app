<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import ProfileSubnav from '~/components/profile/ProfileSubnav.vue'
import ProfileChangePasswordModal from '~/components/attendee/ProfileChangePasswordModal.vue'
import { getFullName } from '~/types'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const { user } = useAuth()
const notifications = useNotifications()
const authStore = useAuthStore()
const profileStore = useUserProfileStore()

const passwordModalOpen = ref(false)

function onReminderToggle(next: boolean): void {
  profileStore.preferences.event_reminders = next
  profileStore.onPreferenceFieldChange()
}

function onMarketingToggle(next: boolean): void {
  profileStore.preferences.marketing_notifications = next
  profileStore.onPreferenceFieldChange()
}

function enable2FA(): void {
  notifications.info({
    title: 'Coming soon',
    description: 'Two-factor authentication setup will be available in a future update.'
  })
}

async function deleteAccount(): Promise<void> {
  if (!confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) {
    return
  }
  const uid = authStore.user?.id
  if (!uid) return
  const api = useApi()
  try {
    await api.delete(`/users/${uid}`)
    notifications.success({
      title: 'Account deleted',
      description: 'Your account has been permanently removed.'
    })
    authStore.clearAuth()
    await navigateTo('/login')
  }
  catch {
    // useApi surfaced the error toast
  }
}

onMounted(() => void profileStore.fetchProfile())
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        Profile
      </h1>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Notifications, security, and account deletion for {{ user ? getFullName(user) : 'your account' }}.
      </p>
    </div>

    <ProfileSubnav
      profile-to="/organizer/profile"
      preferences-to="/organizer/profile/setting"
      activity-to="/organizer/profile/activity"
    />

    <div class="space-y-6">
      <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <AppLucideIcon name="notifications" class="text-primary-500" />
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            Notifications
          </h3>
        </div>
        <div class="p-6 space-y-6">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="font-medium text-slate-900 dark:text-white">
                Event reminders
              </p>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Get notified about upcoming events you're attending.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="profileStore.preferences.event_reminders"
              :disabled="profileStore.loading || profileStore.savingPreferences"
              class="relative inline-flex shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900"
              @click="onReminderToggle(!profileStore.preferences.event_reminders)"
            >
              <span class="sr-only">Toggle event reminders</span>
              <span
                class="relative h-7 w-12 rounded-full transition-colors duration-200"
                :class="profileStore.preferences.event_reminders ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'"
              >
                <span
                  class="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200"
                  :class="profileStore.preferences.event_reminders ? 'translate-x-5' : 'translate-x-0'"
                />
              </span>
            </button>
          </div>
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="font-medium text-slate-900 dark:text-white">
                Marketing &amp; promotions
              </p>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Receive offers and newsletters about new events.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="profileStore.preferences.marketing_notifications"
              :disabled="profileStore.loading || profileStore.savingPreferences"
              class="relative inline-flex shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900"
              @click="onMarketingToggle(!profileStore.preferences.marketing_notifications)"
            >
              <span class="sr-only">Toggle marketing notifications</span>
              <span
                class="relative h-7 w-12 rounded-full transition-colors duration-200"
                :class="profileStore.preferences.marketing_notifications ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'"
              >
                <span
                  class="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200"
                  :class="profileStore.preferences.marketing_notifications ? 'translate-x-5' : 'translate-x-0'"
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <AppLucideIcon name="shield" class="text-primary-500" />
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            Security &amp; privacy
          </h3>
        </div>
        <div class="p-6 space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="font-medium text-slate-900 dark:text-white">
                Password
              </p>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Update your password with your current password for verification.
              </p>
            </div>
            <button
              type="button"
              class="text-sm font-medium text-primary-500 hover:text-primary-600"
              @click="passwordModalOpen = true"
            >
              Change password
            </button>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p class="font-medium text-slate-900 dark:text-white">
                Two-factor authentication
              </p>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Add an extra layer of security to your account.
              </p>
            </div>
            <AppButton color="primary" size="sm" type="button" @click="enable2FA">
              Enable 2FA
            </AppButton>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <AppLucideIcon name="warning" class="text-red-500" />
          <h3 class="text-lg font-semibold text-red-600 dark:text-red-400">
            Danger zone
          </h3>
        </div>
        <div class="p-6 flex flex-wrap items-center justify-between gap-4">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Permanently delete your account and all your data.
          </p>
          <button
            type="button"
            class="text-sm font-medium text-red-500 hover:text-red-600 dark:hover:text-red-400"
            @click="deleteAccount"
          >
            Delete account
          </button>
        </div>
      </div>
    </div>

    <ProfileChangePasswordModal v-model:open="passwordModalOpen" />
  </div>
</template>
