<script setup lang="ts">
import type { OrganizationDocumentKind, OrganizerApplicationFormState } from '~/types/organizer'
import {
  defaultOrganizerForm,
  formToCreateBody,
  validateOrganizerStep
} from '~/utils/organizerApplicationValidation'

definePageMeta({
  layout: 'attendee',
  middleware: ['attendee', 'organizer-application-attendee']
})

const steps = [
  { id: 'profile', title: 'Organization' },
  { id: 'contact', title: 'Contact' },
  { id: 'location', title: 'Location' },
  { id: 'docs', title: 'Documents' }
]

const organizerApplicationStore = useOrganizerApplicationStore()
const notifications = useNotifications()
const authStore = useAuthStore()

const step = ref(1)
const form = ref<OrganizerApplicationFormState>(defaultOrganizerForm())
const fieldErrors = ref<Record<string, string>>({})
const finishing = ref(false)

const uploadProgress = computed(() => organizerApplicationStore.uploadProgress)

const LOGO_MAX = 5 * 1024 * 1024
const DOC_MAX = 10 * 1024 * 1024

onMounted(async () => {
  await organizerApplicationStore.fetchMine()
  if (organizerApplicationStore.application) {
    await navigateTo('/attendee/organizer/application', { replace: true })
    return
  }
  if (authStore.user?.email) {
    form.value.email = authStore.user.email
  }
  if (authStore.user?.phone) {
    form.value.phone_number = authStore.user.phone
  }
})

async function persistProfileIfNeeded(): Promise<boolean> {
  const errs = validateOrganizerStep(3, form.value)
  fieldErrors.value = errs
  if (Object.keys(errs).length) {
    notifications.warning({ title: 'Check highlighted fields', description: 'Please fix validation errors.' })
    return false
  }
  try {
    await organizerApplicationStore.createApplication(formToCreateBody(form.value))
    return true
  }
  catch {
    return false
  }
}

async function goNext(): Promise<void> {
  const errs = validateOrganizerStep(step.value, form.value)
  fieldErrors.value = errs
  if (Object.keys(errs).length) {
    notifications.warning({ title: 'Validation', description: 'Please complete the required fields.' })
    return
  }

  if (step.value === 3) {
    const ok = await persistProfileIfNeeded()
    if (!ok) return
  }

  if (step.value < 4) {
    step.value += 1
  }
}

function goBack(): void {
  if (step.value > 1) step.value -= 1
}

async function onDocSelected(kind: OrganizationDocumentKind, file: File): Promise<void> {
  try {
    await organizerApplicationStore.uploadOrganizerFile(file, kind)
    notifications.success({ title: 'Uploaded', description: `${kind.replace('_', ' ')} saved.` })
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Upload failed'
    notifications.error({ title: 'Upload failed', description: msg })
  }
}

async function finish(): Promise<void> {
  finishing.value = true
  try {
    await organizerApplicationStore.fetchMine()
    notifications.success({
      title: 'Application submitted',
      description: 'You can track status from your application page.'
    })
    await navigateTo('/attendee/organizer/application')
  }
  finally {
    finishing.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        Organizer application
      </h1>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Step-through wizard — your profile is created before document uploads.
      </p>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 space-y-6">
      <OrganizerApplicationStepper
        :current-step="step"
        :steps="steps"
      />

      <OrganizerApplicationForm
        v-show="step <= 3"
        v-model="form"
        :step="step"
        :errors="fieldErrors"
        :disabled="organizerApplicationStore.saving"
      />

      <div
        v-show="step === 4"
        class="space-y-6"
      >
        <DocumentUploader
          label="Organization logo"
          description="PNG, JPG, WebP or GIF — max 5 MB"
          kind="logo"
          accept="image/png,image/jpeg,image/webp,image/gif"
          :max-bytes="LOGO_MAX"
          :existing-url="organizerApplicationStore.application?.logo_url"
          :disabled="organizerApplicationStore.saving"
          :progress="uploadProgress.logo ?? null"
          @select="onDocSelected('logo', $event)"
        />
        <DocumentUploader
          label="Certificate"
          description="PDF or image — max 10 MB"
          kind="certificate"
          accept="application/pdf,image/png,image/jpeg"
          :max-bytes="DOC_MAX"
          :existing-url="organizerApplicationStore.application?.certificate_url"
          :disabled="organizerApplicationStore.saving"
          :progress="uploadProgress.certificate ?? null"
          @select="onDocSelected('certificate', $event)"
        />
        <DocumentUploader
          label="Business license"
          description="PDF or image — max 10 MB"
          kind="business_license"
          accept="application/pdf,image/png,image/jpeg"
          :max-bytes="DOC_MAX"
          :existing-url="organizerApplicationStore.application?.business_license_url"
          :disabled="organizerApplicationStore.saving"
          :progress="uploadProgress.business_license ?? null"
          @select="onDocSelected('business_license', $event)"
        />
      </div>

      <div class="flex flex-wrap justify-between gap-2 pt-2">
        <AppButton
          color="neutral"
          type="button"
          :disabled="step === 1 || organizerApplicationStore.saving"
          @click="goBack"
        >
          Back
        </AppButton>
        <AppButton
          v-if="step < 4"
          type="button"
          :disabled="organizerApplicationStore.saving"
          @click="goNext"
        >
          {{ organizerApplicationStore.saving ? 'Saving…' : 'Continue' }}
        </AppButton>
        <AppButton
          v-else
          type="button"
          color="success"
          :disabled="finishing"
          @click="finish"
        >
          {{ finishing ? 'Finishing…' : 'Finish' }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
