import { defineStore } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import type { OrganizationProfile } from '~/types/organizer'
import { normalizeWebsite } from '~/utils/organizerApplicationValidation'

const STORAGE_KEY = 'organizer_wizard_draft_v2'

export type OrganizerWizardMode = 'create' | 'edit'

function emptyFiles() {
  return {
    logo: null,
    business_license: null,
    verification_document: null
  } as {
    logo: File | null
    business_license: File | null
    verification_document: File | null
  }
}

export const useOrganizerWizardStore = defineStore('organizerWizard', () => {
  const mode = ref<OrganizerWizardMode>('create')
  const step = ref(1)
  const maxReachedStep = ref(1)

  const organization_name = ref('')
  const organization_type = ref('')
  const registration_number = ref('')
  const tax_number = ref('')
  const description = ref('')

  const phone_number = ref('')
  const email = ref('')
  const website = ref('')

  const country = ref('')
  const region_id = ref<number | null>(null)
  const district_id = ref<number | null>(null)
  const ward_id = ref<number | null>(null)
  const region_text = ref('')
  const district_text = ref('')
  const ward_text = ref('')
  const address = ref('')

  const fieldErrors = ref<Record<string, string>>({})

  const pendingFiles = shallowRef(emptyFiles())

  function resetForNewApplication(): void {
    mode.value = 'create'
    step.value = 1
    maxReachedStep.value = 1
    organization_name.value = ''
    organization_type.value = ''
    registration_number.value = ''
    tax_number.value = ''
    description.value = ''
    phone_number.value = ''
    email.value = ''
    website.value = ''
    country.value = ''
    region_id.value = null
    district_id.value = null
    ward_id.value = null
    region_text.value = ''
    district_text.value = ''
    ward_text.value = ''
    address.value = ''
    fieldErrors.value = {}
    pendingFiles.value = emptyFiles()
    if (import.meta.client) {
      try {
        sessionStorage.removeItem(STORAGE_KEY)
      }
      catch {
        /* ignore */
      }
    }
  }

  function hydrateFromProfile(p: OrganizationProfile): void {
    mode.value = 'edit'
    organization_name.value = p.organization_name
    organization_type.value = p.organization_type
    registration_number.value = p.registration_number
    tax_number.value = p.tax_number ?? ''
    description.value = p.description
    phone_number.value = p.phone_number
    email.value = p.email
    website.value = p.website ?? ''
    country.value = p.country
    region_id.value = null
    district_id.value = null
    ward_id.value = null
    region_text.value = p.region ?? ''
    district_text.value = p.district ?? ''
    ward_text.value = p.ward ?? ''
    address.value = p.address ?? ''
    pendingFiles.value = emptyFiles()
    fieldErrors.value = {}
    step.value = 1
    maxReachedStep.value = 4
  }

  function snapshotPersistable(): Record<string, unknown> {
    return {
      organization_name: organization_name.value,
      organization_type: organization_type.value,
      registration_number: registration_number.value,
      tax_number: tax_number.value,
      description: description.value,
      phone_number: phone_number.value,
      email: email.value,
      website: website.value,
      country: country.value,
      region_id: region_id.value,
      district_id: district_id.value,
      ward_id: ward_id.value,
      region_text: region_text.value,
      district_text: district_text.value,
      ward_text: ward_text.value,
      address: address.value,
      step: step.value,
      maxReachedStep: maxReachedStep.value
    }
  }

  function restorePersistable(raw: Record<string, unknown>): void {
    if (typeof raw.organization_name === 'string') organization_name.value = raw.organization_name
    if (typeof raw.organization_type === 'string') organization_type.value = raw.organization_type
    if (typeof raw.registration_number === 'string') registration_number.value = raw.registration_number
    if (typeof raw.tax_number === 'string') tax_number.value = raw.tax_number
    if (typeof raw.description === 'string') description.value = raw.description
    if (typeof raw.phone_number === 'string') phone_number.value = raw.phone_number
    if (typeof raw.email === 'string') email.value = raw.email
    if (typeof raw.website === 'string') website.value = raw.website
    if (typeof raw.country === 'string') country.value = raw.country
    if (typeof raw.region_id === 'number') region_id.value = raw.region_id
    if (typeof raw.district_id === 'number') district_id.value = raw.district_id
    if (typeof raw.ward_id === 'number') ward_id.value = raw.ward_id
    if (typeof raw.region_text === 'string') region_text.value = raw.region_text
    if (typeof raw.district_text === 'string') district_text.value = raw.district_text
    if (typeof raw.ward_text === 'string') ward_text.value = raw.ward_text
    if (typeof raw.address === 'string') address.value = raw.address
    if (typeof raw.step === 'number' && raw.step >= 1 && raw.step <= 4) step.value = raw.step
    if (typeof raw.maxReachedStep === 'number' && raw.maxReachedStep >= 1) {
      maxReachedStep.value = raw.maxReachedStep
    }
  }

  function loadDraftFromSession(): void {
    if (!import.meta.client) return
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const o = JSON.parse(raw) as Record<string, unknown>
      restorePersistable(o)
    }
    catch {
      /* ignore */
    }
  }

  const debouncedPersist = useDebounceFn(() => {
    if (!import.meta.client || mode.value !== 'create') return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshotPersistable()))
    }
    catch {
      /* ignore */
    }
  }, 400)

  watch(
    [
      organization_name,
      organization_type,
      registration_number,
      tax_number,
      description,
      phone_number,
      email,
      website,
      country,
      region_id,
      district_id,
      ward_id,
      region_text,
      district_text,
      ward_text,
      address,
      step,
      maxReachedStep
    ],
    () => {
      debouncedPersist()
    },
    { deep: true }
  )

  function toCreateApiBody(nameCache: Record<number, string>): Record<string, unknown> {
    const rId = region_id.value
    const dId = district_id.value
    const wId = ward_id.value
    const regionName = rId != null ? nameCache[rId] ?? '' : ''
    const districtName = dId != null ? nameCache[dId] ?? '' : ''
    const wardName = wId != null ? nameCache[wId] ?? '' : ''
    return {
      organization_name: organization_name.value.trim(),
      organization_type: organization_type.value.trim(),
      registration_number: registration_number.value.trim(),
      tax_number: tax_number.value.trim() || null,
      description: description.value.trim(),
      phone_number: phone_number.value.trim(),
      email: email.value.trim(),
      website: normalizeWebsite(website.value) ?? null,
      country: country.value.trim(),
      region: regionName.trim() || null,
      district: districtName.trim() || null,
      ward: wardName.trim() || null,
      address: address.value.trim() || null
    }
  }

  function toUpdateApiBody(): Record<string, unknown> {
    return {
      organization_name: organization_name.value.trim(),
      organization_type: organization_type.value.trim(),
      registration_number: registration_number.value.trim(),
      tax_number: tax_number.value.trim() || null,
      description: description.value.trim(),
      phone_number: phone_number.value.trim(),
      email: email.value.trim(),
      website: normalizeWebsite(website.value) ?? null,
      country: country.value.trim(),
      region: region_text.value.trim() || null,
      district: district_text.value.trim() || null,
      ward: ward_text.value.trim() || null,
      address: address.value.trim() || null
    }
  }

  function setFieldError(key: string, msg: string): void {
    fieldErrors.value = { ...fieldErrors.value, [key]: msg }
  }

  function setFieldErrors(e: Record<string, string>): void {
    fieldErrors.value = { ...e }
  }

  function setPendingFile(
    kind: 'logo' | 'business_license' | 'verification_document',
    file: File | null
  ): void {
    pendingFiles.value = { ...pendingFiles.value, [kind]: file }
  }

  function clearFieldErrors(): void {
    fieldErrors.value = {}
  }

  function clearFieldError(key: string): void {
    const { [key]: _removed, ...rest } = fieldErrors.value
    void _removed
    fieldErrors.value = rest
  }

  return {
    mode,
    step,
    maxReachedStep,
    organization_name,
    organization_type,
    registration_number,
    tax_number,
    description,
    phone_number,
    email,
    website,
    country,
    region_id,
    district_id,
    ward_id,
    region_text,
    district_text,
    ward_text,
    address,
    fieldErrors,
    pendingFiles,
    setPendingFile,
    resetForNewApplication,
    hydrateFromProfile,
    loadDraftFromSession,
    toCreateApiBody,
    toUpdateApiBody,
    setFieldErrors,
    setFieldError,
    clearFieldErrors,
    clearFieldError
  }
})
