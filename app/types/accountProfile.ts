/** Consolidated attendee profile payloads from `/api/v1/profile`. */

export interface AccountProfileSlice {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  avatar_url?: string
  region_id?: number | null
  district_id?: number | null
  ward_id?: number | null
}

export interface AccountPreferencesSlice {
  event_reminders: boolean
  marketing_notifications: boolean
}

export interface ProfileStatsSlice {
  events_attended?: number
}

export interface ProfileBundlePayload {
  profile: AccountProfileSlice
  preferences: AccountPreferencesSlice
  additional_info: Record<string, unknown>
  stats?: ProfileStatsSlice
}
