<script setup lang="ts">
import { z } from 'zod'
import {
  firstIssuePath,
  organizerWizardStep1Schema,
  organizerWizardStep2Schema,
  organizerWizardStep3DrillSchema,
  organizerWizardStep3PlainSchema,
  zodErrorsToRecord
} from '~/utils/organizerWizardSchema'

const props = defineProps<{
  variant: 'create' | 'edit'
}>()

const wizard = useOrganizerWizardStore()
const locationStore = useLocationStore()
const orgStore = useOrganizerApplicationStore()
const notifications = useNotifications()
const authStore = useAuthStore()
const config = useRuntimeConfig()

const submitting = ref(false)

const steps = [
  { id: 'organization', title: 'Organization' },
  { id: 'contact', title: 'Contact' },
  { id: 'location', title: 'Location' },
  { id: 'documents', title: 'Documents' }
]

const useDrill = computed(() => props.variant === 'create')

function nameCacheSnapshot(): Record<number, string> {
  return { ...locationStore.nameCache }
}

function scrollToFirstError(key?: string): void {
  if (!key) return
  nextTick(() => {
    document.getElementById(`wizard-field-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

function validateStep(stepNum: number): boolean {
  wizard.clearFieldErrors()
  try {
    if (stepNum === 1) {
      organizerWizardStep1Schema.parse({
        organization_name: wizard.organization_name,
        organization_type: wizard.organization_type,
        registration_number: wizard.registration_number,
        tax_number: wizard.tax_number ?? '',
        description: wizard.description
      })
    }
    else if (stepNum === 2) {
      organizerWizardStep2Schema.parse({
        phone_number: wizard.phone_number,
        email: wizard.email,
        website: wizard.website
      })
    }
    else if (stepNum === 3) {
      if (useDrill.value) {
        organizerWizardStep3DrillSchema.parse({
          country: wizard.country,
          region_id: wizard.region_id ?? 0,
          district_id: wizard.district_id ?? 0,
          ward_id: wizard.ward_id ?? 0,
          address: wizard.address
        })
      }
      else {
        organizerWizardStep3PlainSchema.parse({
          country: wizard.country,
          region: wizard.region_text,
          district: wizard.district_text,
          ward: wizard.ward_text,
          address: wizard.address
        })
      }
    }
    return true
  }
  catch (e) {
    if (e instanceof z.ZodError) {
      wizard.setFieldErrors(zodErrorsToRecord(e))
      scrollToFirstError(firstIssuePath(e))
    }
    return false
  }
}

function validateDocumentsForCreate(): boolean {
  wizard.clearFieldErrors()
  const errs: Record<string, string> = {}
  const p = wizard.pendingFiles
  if (!p.logo) errs.logo = 'Logo is required'
  if (!p.business_license) errs.business_license = 'Business license is required'
  if (!p.verification_document) errs.verification_document = 'Verification document is required'
  if (Object.keys(errs).length) {
    wizard.setFieldErrors(errs)
    scrollToFirstError(Object.keys(errs)[0])
    return false
  }
  return true
}

function onContinue(): void {
  if (!validateStep(wizard.step)) return
  wizard.maxReachedStep = Math.max(wizard.maxReachedStep, wizard.step + 1)
  if (wizard.step < 4) wizard.step += 1
}

function onBack(): void {
  if (wizard.step > 1) wizard.step -= 1
}

function onGoToStep(target: number): void {
  if (target > wizard.maxReachedStep) return
  if (target > wizard.step) {
    for (let i = wizard.step; i < target; i++) {
      if (!validateStep(i)) return
    }
    wizard.maxReachedStep = Math.max(wizard.maxReachedStep, target)
  }
  wizard.step = target
}

async function onSubmitCreate(): Promise<void> {
  for (let s = 1; s <= 3; s++) {
    if (!validateStep(s)) {
      wizard.step = s
      return
    }
  }
  if (!validateDocumentsForCreate()) {
    wizard.step = 4
    return
  }
  if (submitting.value) return
  submitting.value = true
  try {
    const body = wizard.toCreateApiBody(nameCacheSnapshot())
    await orgStore.createApplication(body)
    const { logo, business_license, verification_document } = wizard.pendingFiles
    if (logo) await orgStore.uploadOrganizerFile(logo, 'logo')
    if (business_license) await orgStore.uploadOrganizerFile(business_license, 'business_license')
    if (verification_document) {
      await orgStore.uploadOrganizerFile(verification_document, 'verification_document')
    }
    wizard.resetForNewApplication()
    notifications.success({
      title: 'Application submitted',
      description: 'Track status from your application page.'
    })
    await navigateTo('/attendee/organizer/application')
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Submission failed'
    notifications.error({ title: 'Could not submit', description: msg })
  }
  finally {
    submitting.value = false
  }
}

async function onSubmitEdit(): Promise<void> {
  for (let s = 1; s <= 3; s++) {
    if (!validateStep(s)) {
      wizard.step = s
      return
    }
  }
  if (submitting.value) return
  submitting.value = true
  try {
    await orgStore.updateApplication(wizard.toUpdateApiBody())
    const { logo, business_license, verification_document } = wizard.pendingFiles
    if (logo) await orgStore.uploadOrganizerFile(logo, 'logo')
    if (business_license) await orgStore.uploadOrganizerFile(business_license, 'business_license')
    if (verification_document) {
      await orgStore.uploadOrganizerFile(verification_document, 'verification_document')
    }
    notifications.success({ title: 'Application updated' })
    await navigateTo('/attendee/organizer/application')
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Update failed'
    notifications.error({ title: 'Could not save', description: msg })
  }
  finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (props.variant === 'create') {
    wizard.mode = 'create'
    wizard.loadDraftFromSession()
    if (!wizard.email && authStore.user?.email) wizard.email = authStore.user.email
    if (!wizard.phone_number && authStore.user?.phone) wizard.phone_number = authStore.user.phone
    if (!wizard.country) {
      wizard.country = String(config.public.organizerDefaultCountry || 'Tanzania')
    }
  }
})
</script>

<template>
  <div class="relative max-w-2xl mx-auto space-y-6">
    <div
      v-if="submitting"
      class="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm"
      aria-live="polite"
      aria-busy="true"
    >
      <span class="inline-flex flex-col items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <span class="size-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        Submitting…
      </span>
    </div>

    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        Organizer application
      </h1>
      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
        Complete all steps. Location uses the same region → district → ward drill-down as your profile.
      </p>
    </div>

    <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 space-y-6">
      <WizardProgress
        :current-step="wizard.step"
        :max-reached-step="wizard.maxReachedStep"
        :steps="steps"
        @go-to-step="onGoToStep"
      />

      <div v-show="wizard.step === 1">
        <OrganizationStep />
      </div>
      <div v-show="wizard.step === 2">
        <ContactStep />
      </div>
      <div v-show="wizard.step === 3">
        <LocationStep :use-drill="useDrill" />
      </div>
      <div v-show="wizard.step === 4">
        <DocumentsStep :mode="variant" />
      </div>

      <div class="flex flex-wrap justify-between gap-2 pt-2">
        <AppButton
          color="neutral"
          type="button"
          :disabled="wizard.step === 1 || submitting"
          @click="onBack"
        >
          Back
        </AppButton>
        <AppButton
          v-if="wizard.step < 4"
          type="button"
          :disabled="submitting"
          @click="onContinue"
        >
          Continue
        </AppButton>
        <AppButton
          v-else-if="variant === 'create'"
          type="button"
          color="success"
          :disabled="submitting"
          @click="onSubmitCreate"
        >
          Submit application
        </AppButton>
        <AppButton
          v-else
          type="button"
          color="success"
          :disabled="submitting"
          @click="onSubmitEdit"
        >
          Save changes
        </AppButton>
      </div>
    </div>
  </div>
</template>
