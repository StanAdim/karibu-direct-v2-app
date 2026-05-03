<script setup lang="ts">
import { getFullName } from '~/types'
import { resolveApiUploadUrl } from '~/utils/mediaUrl'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee'
})

const config = useRuntimeConfig()
const { user } = useAuth()
const notifications = useNotifications()
const authStore = useAuthStore()
const profileStore = useUserProfileStore()

const fileInputRef = ref<HTMLInputElement | null>(null)
/** Local blob preview immediately after picking a file (revoked after upload completes). */
const avatarPreviewBlobUrl = ref<string | null>(null)

const apiBaseStr = computed(() => String(config.public.apiBase ?? ''))

const displayName = computed(() =>
  getFullName({
    first_name: profileStore.profile.first_name,
    last_name: profileStore.profile.last_name
  })
)

const displayAvatarUrl = computed(() => {
  if (avatarPreviewBlobUrl.value) return avatarPreviewBlobUrl.value

  const fromProfile = resolveApiUploadUrl(profileStore.profile.avatar_url, apiBaseStr.value)
  if (fromProfile) return fromProfile

  return resolveApiUploadUrl(user.value?.avatar, apiBaseStr.value)
})

const memberSince = computed(() => {
  if (!user.value?.created_at) return '—'
  return new Date(user.value.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const accountStatusLabel = computed(() => {
  const s = user.value?.status
  // Auth payloads sometimes omit ``status``; authenticated users behave as active.
  if (!s || s === 'active') return 'Verified'
  return s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')
})

const locationLine = computed(() => {
  const loc = profileStore.profile.location?.trim()
  if (loc) return loc
  const extra = profileStore.additional_info.location
  if (typeof extra === 'string' && extra.trim()) return extra.trim()
  return '—'
})

const eventsAttended = computed(() => profileStore.stats.events_attended ?? 0)

async function saveProfile(): Promise<void> {
  await profileStore.updateProfile()
}

function triggerAvatarPick(): void {
  fileInputRevoke()
  fileInputRef.value?.click()
}

function fileInputRevoke(): void {
  if (avatarPreviewBlobUrl.value) {
    URL.revokeObjectURL(avatarPreviewBlobUrl.value)
    avatarPreviewBlobUrl.value = null
  }
}

async function onAvatarFileChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !file.type.startsWith('image/')) return
  avatarPreviewBlobUrl.value = URL.createObjectURL(file)
  const ok = await profileStore.uploadAvatar(file)
  fileInputRevoke()
  if (!ok) {
    notifications.error({
      title: 'Upload failed',
      description: profileStore.error ?? 'Could not upload your photo.'
    })
  }
}

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

onUnmounted(() => {
  fileInputRevoke()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        Profile Settings
      </h1>
      <p class="mt-1 text-slate-600 dark:text-slate-400 text-sm">
        Manage your account information, notification preferences, and security settings.
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-[280px_1fr]">
      <!-- Left: Profile Summary card -->
      <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 h-fit">
        <div class="relative inline-block">
          <UAvatar
            :src="displayAvatarUrl"
            :alt="displayName"
            size="2xl"
            class="ring-4 ring-slate-100 dark:ring-slate-800"
          />
          <input
            ref="fileInputRef"
            type="file"
            class="hidden"
            accept="image/jpeg,image/png,image/gif,image/webp"
            aria-hidden="true"
            @change="onAvatarFileChange"
          >
          <button
            type="button"
            class="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white shadow-md hover:bg-primary-600 transition-colors disabled:opacity-50"
            :disabled="profileStore.saving || profileStore.loading"
            aria-label="Change photo"
            @click="triggerAvatarPick"
          >
            <span class="material-symbols-outlined text-lg">photo_camera</span>
          </button>
        </div>
        <h2 class="mt-4 text-lg font-bold text-slate-900 dark:text-white">
          {{ displayName }}
        </h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Member since {{ memberSince }}
        </p>
        <p class="mt-2 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
          <span class="material-symbols-outlined text-base">location_on</span>
          {{ locationLine }}
        </p>
        <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Account Status: <span class="font-medium text-emerald-600 dark:text-emerald-400">{{ accountStatusLabel }}</span>
          </p>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Events Attended: <span class="font-semibold text-slate-900 dark:text-white">{{ eventsAttended }}</span>
          </p>
        </div>
      </div>

      <!-- Right: Settings cards -->
      <div class="space-y-6">
        <!-- Personal Information -->
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <span class="material-symbols-outlined text-primary-500">person</span>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
              Personal Information
            </h3>
          </div>
          <form class="p-6 space-y-4" @submit.prevent="saveProfile">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AppInput
                v-model="profileStore.profile.first_name"
                label="First Name"
                placeholder="John"
                icon="i-lucide-user"
                required
                :disabled="profileStore.loading"
              />
              <AppInput
                v-model="profileStore.profile.last_name"
                label="Last Name"
                placeholder="Doe"
                icon="i-lucide-user"
                required
                :disabled="profileStore.loading"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                :value="profileStore.profile.email"
                type="email"
                class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 text-sm outline-none cursor-not-allowed"
                placeholder="alex.j@example.com"
                disabled
                readonly
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                v-model="profileStore.profile.phone_number"
                type="tel"
                class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="+1 (555) 000-1234"
                :disabled="profileStore.loading"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
              <input
                v-model="profileStore.profile.location"
                type="text"
                class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="City, State / Region"
                :disabled="profileStore.loading"
              >
            </div>
            <div class="flex justify-end">
              <UButton
                type="submit"
                color="primary"
                :loading="profileStore.saving"
                :disabled="profileStore.loading"
              >
                Save Changes
              </UButton>
            </div>
          </form>
        </div>

        <!-- Notifications -->
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <span class="material-symbols-outlined text-primary-500">notifications</span>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
              Notifications
            </h3>
          </div>
          <div class="p-6 space-y-6">
            <label class="flex items-center justify-between gap-4">
              <div>
                <p class="font-medium text-slate-900 dark:text-white">
                  Event Reminders
                </p>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Get notified about upcoming events you're attending.
                </p>
              </div>
              <USwitch
                :model-value="profileStore.preferences.event_reminders"
                :disabled="profileStore.loading || profileStore.savingPreferences"
                @update:model-value="onReminderToggle($event)"
              />
            </label>
            <label class="flex items-center justify-between gap-4">
              <div>
                <p class="font-medium text-slate-900 dark:text-white">
                  Marketing &amp; Promotions
                </p>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Receive offers and newsletters about new events.
                </p>
              </div>
              <USwitch
                :model-value="profileStore.preferences.marketing_notifications"
                :disabled="profileStore.loading || profileStore.savingPreferences"
                @update:model-value="onMarketingToggle($event)"
              />
            </label>
          </div>
        </div>

        <!-- Security & Privacy -->
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <span class="material-symbols-outlined text-primary-500">shield</span>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
              Security &amp; Privacy
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
              <NuxtLink to="/attendee/settings" class="text-sm font-medium text-primary-500 hover:text-primary-600">
                Change Password
              </NuxtLink>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p class="font-medium text-slate-900 dark:text-white">
                  Two-Factor Authentication
                </p>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Add an extra layer of security to your account.
                </p>
              </div>
              <UButton color="primary" size="sm" @click="enable2FA">
                Enable 2FA
              </UButton>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="rounded-2xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <span class="material-symbols-outlined text-red-500">warning</span>
            <h3 class="text-lg font-semibold text-red-600 dark:text-red-400">
              Danger Zone
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
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
