import { z } from 'zod'
import { isLikelyE164Phone, isValidHttpUrl } from '~/utils/organizerApplicationValidation'

const trimString = z.string().trim()

export const organizerWizardStep1Schema = z.object({
  organization_name: trimString.min(2, 'Min 2 characters').max(255),
  organization_type: trimString.min(2, 'Required').max(120),
  registration_number: trimString.min(2, 'Required').max(120),
  tax_number: z.string().optional(),
  description: trimString.min(10, 'At least 10 characters').max(8000)
})

export const organizerWizardStep2Schema = z.object({
  phone_number: trimString.min(1, 'Required').refine(v => isLikelyE164Phone(v), {
    message: 'Use country code (e.g. +255700000000)'
  }),
  email: trimString.min(1, 'Required').email('Invalid email'),
  website: trimString.refine(v => !v || isValidHttpUrl(v), { message: 'Invalid URL' })
})

export const organizerWizardStep3DrillSchema = z.object({
  country: trimString.min(2, 'Required').max(120),
  region_id: z.number().int().positive('Select a region'),
  district_id: z.number().int().positive('Select a district'),
  ward_id: z.number().int().positive('Select a ward'),
  address: trimString.min(1, 'Address is required').max(2000)
})

export const organizerWizardStep3PlainSchema = z.object({
  country: trimString.min(2, 'Required').max(120),
  region: z.string().optional(),
  district: z.string().optional(),
  ward: z.string().optional(),
  address: trimString.min(1, 'Address is required').max(2000)
})

export function zodErrorsToRecord(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of err.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !out[key]) {
      out[key] = issue.message
    }
  }
  return out
}

export function firstIssuePath(err: z.ZodError): string | undefined {
  const k = err.issues[0]?.path[0]
  return typeof k === 'string' ? k : undefined
}
