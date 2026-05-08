import type { OrganizerApplicationFormState } from '~/types/organizer'

/** Loose E.164-style check (align with backend “e164ish” expectations). */
export function isLikelyE164Phone(input: string): boolean {
  const s = input.trim()
  if (s.length < 8 || s.length > 20) return false
  return /^\+?[0-9][\d\s-]{6,18}\d$/.test(s.replace(/[{()}]/g, ''))
}

export function isValidHttpUrl(input: string): boolean {
  const t = input.trim()
  if (!t) return true
  try {
    const u = new URL(t.startsWith('http') ? t : `https://${t}`)
    return u.protocol === 'http:' || u.protocol === 'https:'
  }
  catch {
    return false
  }
}

export function normalizeWebsite(input: string): string | undefined {
  const t = input.trim()
  if (!t) return undefined
  const withProto = t.startsWith('http://') || t.startsWith('https://') ? t : `https://${t}`
  return withProto
}

export function validateOrganizerStep(
  step: number,
  form: OrganizerApplicationFormState
): Record<string, string> {
  const e: Record<string, string> = {}

  if (step <= 1) {
    if (!form.organization_name.trim() || form.organization_name.trim().length < 2) {
      e.organization_name = 'Organization name is required (min 2 characters).'
    }
    if (!form.organization_type.trim() || form.organization_type.trim().length < 2) {
      e.organization_type = 'Organization type is required.'
    }
    if (!form.registration_number.trim() || form.registration_number.trim().length < 2) {
      e.registration_number = 'Registration number is required.'
    }
    if (!form.description.trim() || form.description.trim().length < 10) {
      e.description = 'Description must be at least 10 characters.'
    }
  }

  if (step <= 2) {
    if (!form.phone_number.trim()) {
      e.phone_number = 'Phone number is required.'
    }
    else if (!isLikelyE164Phone(form.phone_number)) {
      e.phone_number = 'Enter a valid phone number (include country code, e.g. +255700000000).'
    }
    if (!form.email.trim()) {
      e.email = 'Email is required.'
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = 'Enter a valid email address.'
    }
    if (form.website.trim() && !isValidHttpUrl(form.website)) {
      e.website = 'Enter a valid website URL.'
    }
  }

  if (step <= 3) {
    if (!form.country.trim() || form.country.trim().length < 2) {
      e.country = 'Country is required.'
    }
  }

  return e
}

export function defaultOrganizerForm(): OrganizerApplicationFormState {
  return {
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
  }
}

export function profileToForm(p: {
  organization_name: string
  organization_type: string
  registration_number: string
  tax_number: string | null
  description: string
  phone_number: string
  email: string
  website: string | null
  country: string
  region: string | null
  district: string | null
  ward: string | null
  address: string | null
}): OrganizerApplicationFormState {
  return {
    organization_name: p.organization_name,
    organization_type: p.organization_type,
    registration_number: p.registration_number,
    tax_number: p.tax_number ?? '',
    description: p.description,
    phone_number: p.phone_number,
    email: p.email,
    website: p.website ?? '',
    country: p.country,
    region: p.region ?? '',
    district: p.district ?? '',
    ward: p.ward ?? '',
    address: p.address ?? ''
  }
}

export function formToCreateBody(form: OrganizerApplicationFormState): Record<string, unknown> {
  return {
    organization_name: form.organization_name.trim(),
    organization_type: form.organization_type.trim(),
    registration_number: form.registration_number.trim(),
    tax_number: form.tax_number.trim() || null,
    description: form.description.trim(),
    phone_number: form.phone_number.trim(),
    email: form.email.trim(),
    website: normalizeWebsite(form.website) ?? null,
    country: form.country.trim(),
    region: form.region.trim() || null,
    district: form.district.trim() || null,
    ward: form.ward.trim() || null,
    address: form.address.trim() || null
  }
}

export function formToUpdateBody(form: OrganizerApplicationFormState): Record<string, unknown> {
  return formToCreateBody(form)
}
