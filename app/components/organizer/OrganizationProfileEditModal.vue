<script setup lang="ts">
import type { OrganizationProfile } from '~/types/organizer'
import AppModal from '~/components/common/AppModal.vue'
import { resolveBackendMediaUrl } from '~/utils/mediaUrl'

const props = defineProps<{
  modelValue: boolean
  profile: OrganizationProfile
}>()

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
}>()

const workspace = useOrganizerWorkspaceStore()
const notifications = useNotifications()
const config = useRuntimeConfig()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const form = reactive({
  organization_name: '',
  organization_type: '',
  registration_number: '',
  tax_number: '',
  description: '',
  phone_number: '',
  email: '',
  website: '',
  country: '',
  region: '',
  district: '',
  ward: '',
  address: ''
})

watch(
  () => props.profile,
  (p) => {
    if (!p) return
    form.organization_name = p.organization_name
    form.organization_type = p.organization_type
    form.registration_number = p.registration_number
    form.tax_number = p.tax_number ?? ''
    form.description = p.description
    form.phone_number = p.phone_number
    form.email = p.email
    form.website = p.website ?? ''
    form.country = p.country
    form.region = p.region ?? ''
    form.district = p.district ?? ''
    form.ward = p.ward ?? ''
    form.address = p.address ?? ''
  },
  { immediate: true }
)

const logoPreview = ref<string | null>(null)
const bannerPreview = ref<string | null>(null)
let logoPreviewUrl: string | null = null
let bannerPreviewUrl: string | null = null

onUnmounted(() => {
  if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl)
  if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl)
})

const logoDisplay = computed(() => {
  if (logoPreview.value) return logoPreview.value
  return resolveBackendMediaUrl(props.profile.logo_url, String(config.public.apiBase ?? ''))
})

const bannerDisplay = computed(() => {
  if (bannerPreview.value) return bannerPreview.value
  return resolveBackendMediaUrl(props.profile.banner_url, String(config.public.apiBase ?? ''))
})

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const ALLOWED_IMAGE = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE.has(file.type)) {
    return 'Please use JPEG, PNG, WebP, or GIF.'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image must be under 10MB.'
  }
  return null
}

async function onLogoInput(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const err = validateImage(file)
  if (err) {
    notifications.error({ title: err })
    return
  }
  if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl)
  logoPreviewUrl = URL.createObjectURL(file)
  logoPreview.value = logoPreviewUrl
  try {
    await workspace.uploadAsset(file, 'logo')
    notifications.success({ title: 'Logo updated' })
  }
  catch (e) {
    notifications.error({ title: (e as Error)?.message || 'Logo upload failed' })
  }
}

async function onBannerInput(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const err = validateImage(file)
  if (err) {
    notifications.error({ title: err })
    return
  }
  if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl)
  bannerPreviewUrl = URL.createObjectURL(file)
  bannerPreview.value = bannerPreviewUrl
  try {
    await workspace.uploadAsset(file, 'banner')
    notifications.success({ title: 'Banner updated' })
  }
  catch (e) {
    notifications.error({ title: (e as Error)?.message || 'Banner upload failed' })
  }
}

const fieldError = ref<string | null>(null)

async function save(): Promise<void> {
  fieldError.value = null
  if ((form.description?.trim().length ?? 0) < 10) {
    fieldError.value = 'Description must be at least 10 characters.'
    return
  }
  if (!form.organization_name?.trim() || !form.email?.trim()) {
    fieldError.value = 'Organization name and email are required.'
    return
  }

  const prev = workspace.profile ? { ...workspace.profile } : null
  workspace.mergeProfilePatch({ ...form } as Partial<OrganizationProfile>)

  try {
    await workspace.updateProfile({
      organization_name: form.organization_name.trim(),
      organization_type: form.organization_type.trim(),
      registration_number: form.registration_number.trim(),
      tax_number: form.tax_number.trim() || null,
      description: form.description.trim(),
      phone_number: form.phone_number.trim(),
      email: form.email.trim(),
      website: form.website.trim() || null,
      country: (form.country || config.public.organizerDefaultCountry || 'Tanzania').trim(),
      region: form.region.trim() || null,
      district: form.district.trim() || null,
      ward: form.ward.trim() || null,
      address: form.address.trim() || null
    })
    notifications.success({ title: 'Profile saved' })
    isOpen.value = false
  }
  catch (e) {
    if (prev) workspace.profile = prev
    notifications.error({ title: (e as Error)?.message || 'Could not save profile' })
  }
}
</script>

<template>
  <AppModal v-model="isOpen" max-width="3xl" align="top">
    <div class="p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">
        Edit organization
      </h2>
      <p class="text-sm text-slate-500 mt-1 mb-5">
        Changes apply to your public organizer profile.
      </p>

      <div
        v-if="fieldError"
        class="mb-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/80 dark:bg-red-950/30 px-3 py-2 text-sm text-red-800 dark:text-red-100"
      >
        {{ fieldError }}
      </div>

      <div class="grid gap-5">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Logo
            </p>
            <div class="flex gap-3 items-start">
              <div class="size-20 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                <img v-if="logoDisplay" :src="logoDisplay" alt="" class="size-full object-cover">
              </div>
              <div class="min-w-0 flex-1">
                <label
                  class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 px-3 py-4 cursor-pointer hover:border-primary-400/60 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <AppLucideIcon name="photo_camera" class="text-slate-400 text-xl" />
                  <span class="text-xs text-slate-600 dark:text-slate-300 mt-1">Drop or browse</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    class="sr-only"
                    @change="onLogoInput"
                  >
                </label>
                <p
                  v-if="workspace.uploadProgress.logo != null"
                  class="text-xs text-primary-600 mt-1"
                >
                  Uploading… {{ workspace.uploadProgress.logo }}%
                </p>
              </div>
            </div>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Banner
            </p>
            <div class="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 overflow-hidden bg-slate-50 dark:bg-slate-800/50">
              <div class="h-24 w-full">
                <img v-if="bannerDisplay" :src="bannerDisplay" alt="" class="size-full object-cover">
              </div>
              <label class="flex items-center justify-center gap-2 py-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800">
                <AppLucideIcon name="photo_camera" class="text-slate-400" />
                <span class="text-sm text-slate-600 dark:text-slate-300">Upload banner</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  class="sr-only"
                  @change="onBannerInput"
                >
              </label>
            </div>
            <p
              v-if="workspace.uploadProgress.banner != null"
              class="text-xs text-primary-600 mt-1"
            >
              Uploading… {{ workspace.uploadProgress.banner }}%
            </p>
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-3">
          <label class="block text-sm">
            <span class="text-slate-600 dark:text-slate-400">Organization name</span>
            <input
              v-model="form.organization_name"
              class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            >
          </label>
          <label class="block text-sm">
            <span class="text-slate-600 dark:text-slate-400">Type</span>
            <input
              v-model="form.organization_type"
              class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            >
          </label>
          <label class="block text-sm">
            <span class="text-slate-600 dark:text-slate-400">Registration #</span>
            <input
              v-model="form.registration_number"
              class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono"
            >
          </label>
          <label class="block text-sm">
            <span class="text-slate-600 dark:text-slate-400">Tax #</span>
            <input
              v-model="form.tax_number"
              class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            >
          </label>
        </div>

        <label class="block text-sm">
          <span class="text-slate-600 dark:text-slate-400">Description</span>
          <textarea
            v-model="form.description"
            rows="4"
            class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          />
        </label>

        <div class="grid sm:grid-cols-2 gap-3">
          <label class="block text-sm">
            <span class="text-slate-600 dark:text-slate-400">Phone</span>
            <input
              v-model="form.phone_number"
              class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            >
          </label>
          <label class="block text-sm">
            <span class="text-slate-600 dark:text-slate-400">Email</span>
            <input
              v-model="form.email"
              type="email"
              class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            >
          </label>
          <label class="block text-sm sm:col-span-2">
            <span class="text-slate-600 dark:text-slate-400">Website</span>
            <input
              v-model="form.website"
              type="url"
              placeholder="https://"
              class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            >
          </label>
        </div>

        <div class="grid sm:grid-cols-2 gap-3">
          <label class="block text-sm">
            <span class="text-slate-600 dark:text-slate-400">Country</span>
            <input
              v-model="form.country"
              class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            >
          </label>
          <label class="block text-sm">
            <span class="text-slate-600 dark:text-slate-400">Region</span>
            <input
              v-model="form.region"
              class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            >
          </label>
          <label class="block text-sm">
            <span class="text-slate-600 dark:text-slate-400">District</span>
            <input
              v-model="form.district"
              class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            >
          </label>
          <label class="block text-sm">
            <span class="text-slate-600 dark:text-slate-400">Ward</span>
            <input
              v-model="form.ward"
              class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            >
          </label>
          <label class="block text-sm sm:col-span-2">
            <span class="text-slate-600 dark:text-slate-400">Address</span>
            <input
              v-model="form.address"
              class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            >
          </label>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <AppButton
          type="button"
          color="neutral"
          :disabled="workspace.savingProfile"
          @click="isOpen = false"
        >
          Cancel
        </AppButton>
        <AppButton
          type="button"
          :loading="workspace.savingProfile"
          @click="save"
        >
          Save changes
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
