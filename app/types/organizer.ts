/** Organizer application workflow types (aligned with API `OrganizationProfile` + admin review). */

export type ApplicationStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'

export type AdminReviewAction = 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES'

export type OrganizationDocumentKind =
  | 'certificate'
  | 'business_license'
  | 'logo'
  | 'verification_document'

export type OrganizerLogAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DOCUMENT_UPLOADED'
  | 'STATUS_CHANGED'
  | 'REVIEW_APPROVED'
  | 'REVIEW_REJECTED'
  | 'REVIEW_REQUEST_CHANGES'
  | string

export interface OrganizationProfile {
  id: string
  user_id: string
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
  logo_url: string | null
  certificate_url: string | null
  business_license_url: string | null
  verification_document_url: string | null
  status: ApplicationStatus
  rejection_reason: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface OrganizerApplicationLogEntry {
  id: string
  organization_profile_id: string
  action: OrganizerLogAction
  previous_status: ApplicationStatus | string | null
  new_status: ApplicationStatus | string | null
  comment: string | null
  performed_by: string | null
  created_at: string
}

export interface OrganizerApplicationAdminDetail {
  profile: OrganizationProfile
  logs: OrganizerApplicationLogEntry[]
}

export interface UploadResponse {
  document_kind: OrganizationDocumentKind
  url: string
  stored_path: string
}

export type OrganizerApplication = OrganizationProfile

export interface ApplicationReview {
  action: AdminReviewAction
  comment?: string | null
}

/** @deprecated Use ApplicationReview */
export type ApplicationReviewPayload = ApplicationReview

export interface OrganizerApplicationFormState {
  organization_name: string
  organization_type: string
  registration_number: string
  tax_number: string
  description: string
  phone_number: string
  email: string
  website: string
  country: string
  region: string
  district: string
  ward: string
  address: string
}

export interface OrganizerApplicationsPaginationMeta {
  total: number
  page: number
  size: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}
