import type { User } from './user'

export interface Event {
  id: string
  title: string
  slug: string
  description: string
  short_description?: string
  cover_image?: string
  start_date: string
  end_date: string
  timezone: string
  venue: EventVenue
  status: EventStatus
  visibility: EventVisibility
  capacity: number
  registered_count: number
  organizer_id: string
  organizer?: User
  categories: string[]
  tags: string[]
  ticket_types: TicketType[]
  settings: EventSettings
  created_at: string
  updated_at: string
}

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed' | 'archived'

export type EventVisibility = 'public' | 'private' | 'unlisted'

export interface EventVenue {
  type: 'physical' | 'virtual' | 'hybrid'
  name?: string
  address?: string
  city?: string
  country?: string
  coordinates?: {
    lat: number
    lng: number
  }
  virtual_url?: string
  virtual_platform?: string
}

export interface TicketType {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  quantity: number
  sold_count: number
  max_per_order: number
  sales_start: string
  sales_end: string
  status: 'available' | 'sold_out' | 'expired' | 'hidden'
}

export interface EventSettings {
  require_approval: boolean
  allow_waitlist: boolean
  show_attendee_count: boolean
  enable_check_in: boolean
  enable_notifications: boolean
  custom_fields?: EventCustomField[]
}

export interface EventCustomField {
  id: string
  label: string
  type: 'text' | 'number' | 'select' | 'checkbox' | 'date'
  required: boolean
  options?: string[]
}

export interface EventCreateInput {
  title: string
  description: string
  short_description?: string
  cover_image?: string
  start_date: string
  end_date: string
  timezone: string
  venue: EventVenue
  visibility: EventVisibility
  capacity: number
  categories?: string[]
  tags?: string[]
}

export interface EventUpdateInput extends Partial<EventCreateInput> {
  status?: EventStatus
  settings?: Partial<EventSettings>
}

export interface EventFilters {
  status?: EventStatus
  visibility?: EventVisibility
  category?: string
  search?: string
  start_date?: string
  end_date?: string
  organizer_id?: string
}

export interface EventStats {
  total_registrations: number
  checked_in: number
  tickets_sold: number
  revenue: number
  page_views: number
  conversion_rate: number
}

export function isEventLive(event: Event): boolean {
  const now = new Date()
  const start = new Date(event.start_date)
  const end = new Date(event.end_date)
  return now >= start && now <= end && event.status === 'published'
}

export function isEventUpcoming(event: Event): boolean {
  const now = new Date()
  const start = new Date(event.start_date)
  return now < start && event.status === 'published'
}

export function isEventPast(event: Event): boolean {
  const now = new Date()
  const end = new Date(event.end_date)
  return now > end
}

export function getEventCapacityPercentage(event: Event): number {
  if (event.capacity === 0) return 0
  return Math.round((event.registered_count / event.capacity) * 100)
}
