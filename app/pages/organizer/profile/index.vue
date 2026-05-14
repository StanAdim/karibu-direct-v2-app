<script setup lang="ts">
import AppAvatar from '~/components/common/AppAvatar.vue'
import AppButton from '~/components/ui/AppButton.vue'
import ProfileSubnav from '~/components/profile/ProfileSubnav.vue'
import ProfileGeoModal from '~/components/attendee/ProfileGeoModal.vue'
import { getFullName } from '~/types'
import { resolveApiUploadUrl } from '~/utils/mediaUrl'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const config = useRuntimeConfig()
const { user } = useAuth()
const notifications = useNotifications()
const profileStore = useUserProfileStore()
const locationStore = useLocationStore()

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
  if (user.value?.is_active === false) return 'Inactive'
  return 'Active'
})

const geoModalOpen = ref(false)

const geoLabel = ref('—')

/** Title-case every whitespace-delimited word in each segment (`region / district / ward`). */
function capitalizeGeoLabelSegments(line: string): string {
  return line
    .split(' / ')
    .map(part =>
      part
        .trim()
        .split(/\s+/u)
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    )
    .filter(Boolean)
    .join(' / ')
}

watch(
  () => ({
    r: profileStore.location.region_id,
    d: profileStore.location.district_id,
    w: profileStore.location.ward_id
  }),
  async () => {
    await locationStore.hydrateNamesForProfile(profileStore.location)
    const line = locationStore.profileGeoLabel(profileStore.location).trim()
    geoLabel.value = line ? capitalizeGeoLabelSegments(line) : '—'
  },
  { deep: true, immediate: true },
)

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

onMounted(() => void profileStore.fetchProfile())

onUnmounted(() => {
  fileInputRevoke()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        Profile
      </h1>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Your personal attendee account — photo, details, and location. This is separate from your organization profile.
      </p>
    </div>

    <ProfileSubnav
      profile-to="/organizer/profile"
      preferences-to="/organizer/profile/setting"
      activity-to="/organizer/profile/activity"
    />

    <div class="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 h-fit">
        <div class="relative inline-block">
          <AppAvatar
            :src="displayAvatarUrl ?? null"
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
            <AppLucideIcon name="photo_camera" class="text-lg" />
          </button>
        </div>
        <h2 class="mt-4 text-lg font-bold text-slate-900 dark:text-white">
          {{ displayName }}
        </h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Member since {{ memberSince }}
        </p>
        <p class="mt-2 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
          <AppLucideIcon name="location_on" class="text-base" />
          {{ geoLabel }}
        </p>
        <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Account Status:
            <span
              class="font-medium"
              :class="
                user?.is_active === false
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              "
            >{{ accountStatusLabel }}</span>
          </p>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Events attended: <span class="font-semibold text-slate-900 dark:text-white">{{ eventsAttended }}</span>
          </p>
        </div>
      </div>

      <div class="space-y-6">
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div class="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <AppLucideIcon name="person" class="text-primary-500" />
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
              Personal information
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
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email address</label>
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
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone number</label>
              <input
                v-model="profileStore.profile.phone_number"
                type="tel"
                class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="+2557-xxxx-xxxx"
                :disabled="profileStore.loading"
              >
            </div>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="flex-1">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <p class="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 ">
                  {{ geoLabel }}
                </p>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Region, district, and ward are stored as structured references to the location catalogue.
                </p>
              </div>
              <button
                type="button"
                class="shrink-0 self-end sm:self-start rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                @click="geoModalOpen = true"
              >
                Edit location
              </button>
            </div>
            <div class="flex justify-end">
              <AppButton
                type="submit"
                :disabled="profileStore.loading || profileStore.saving"
              >
                {{ profileStore.saving ? 'Saving…' : 'Save changes' }}
              </AppButton>
            </div>
          </form>
        </div>
      </div>
    </div>
    <ProfileGeoModal v-model:open="geoModalOpen" />
  </div>
</template>
