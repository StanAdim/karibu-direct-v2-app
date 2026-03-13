<script setup lang="ts">
import { getFullName } from '~/types'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee'
})

const { user } = useAuth()
const notifications = useNotifications()

const loading = ref(false)
const eventReminders = ref(true)
const marketingPromotions = ref(false)
const passwordLastChanged = '4 months ago'

const profile = reactive({
  fullName: '',
  email: '',
  phone: ''
})

watch(user, (newUser) => {
  if (newUser) {
    profile.fullName = getFullName(newUser)
    profile.email = newUser.email || ''
    profile.phone = newUser.phone || '+1 (555) 000-1234'
  }
}, { immediate: true })

const memberSince = computed(() => {
  if (!user.value?.createdAt) return '—'
  return new Date(user.value.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

async function saveProfile() {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    notifications.success('Profile updated successfully')
  } catch {
    notifications.error('Failed to update profile')
  } finally {
    loading.value = false
  }
}

function enable2FA() {
  notifications.info('Two-factor authentication setup coming soon.')
}

function deleteAccount() {
  if (confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) {
    notifications.error('Account deletion is disabled in this demo.')
  }
}
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
            :src="user?.avatar"
            :alt="profile.fullName"
            size="2xl"
            class="ring-4 ring-slate-100 dark:ring-slate-800"
          />
          <button
            type="button"
            class="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white shadow-md hover:bg-primary-600 transition-colors"
            aria-label="Change photo"
          >
            <span class="material-symbols-outlined text-lg">photo_camera</span>
          </button>
        </div>
        <h2 class="mt-4 text-lg font-bold text-slate-900 dark:text-white">
          {{ profile.fullName || 'Attendee' }}
        </h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Member since {{ memberSince }}
        </p>
        <p class="mt-2 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
          <span class="material-symbols-outlined text-base">location_on</span>
          San Francisco, CA
        </p>
        <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Account Status: <span class="font-medium text-emerald-600 dark:text-emerald-400">Verified</span>
          </p>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Events Attended: <span class="font-semibold text-slate-900 dark:text-white">12</span>
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
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                v-model="profile.fullName"
                type="text"
                class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                placeholder="Alex Johnson"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                v-model="profile.email"
                type="email"
                class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 text-sm outline-none cursor-not-allowed"
                placeholder="alex.j@example.com"
                disabled
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                v-model="profile.phone"
                type="tel"
                class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                placeholder="+1 (555) 000-1234"
              >
            </div>
            <div class="flex justify-end">
              <UButton type="submit" color="primary" :loading="loading">
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
                <p class="font-medium text-slate-900 dark:text-white">Event Reminders</p>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Get notified about upcoming events you're attending.</p>
              </div>
              <USwitch v-model="eventReminders" />
            </label>
            <label class="flex items-center justify-between gap-4">
              <div>
                <p class="font-medium text-slate-900 dark:text-white">Marketing & Promotions</p>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Receive offers and newsletters about new events.</p>
              </div>
              <USwitch v-model="marketingPromotions" />
            </label>
          </div>
        </div>

        <!-- Security & Privacy -->
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <span class="material-symbols-outlined text-primary-500">shield</span>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
              Security & Privacy
            </h3>
          </div>
          <div class="p-6 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="font-medium text-slate-900 dark:text-white">Password</p>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Last changed {{ passwordLastChanged }}.</p>
              </div>
              <NuxtLink to="/attendee/settings" class="text-sm font-medium text-primary-500 hover:text-primary-600">
                Change Password
              </NuxtLink>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p class="font-medium text-slate-900 dark:text-white">Two-Factor Authentication</p>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Add an extra layer of security to your account.</p>
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
