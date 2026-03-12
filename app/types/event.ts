import type { User } from './user'

export interface Event {
  id: string
  title: string
  slug: string
  description: string
  shortDescription?: string
  coverImage?: string
  startDate: string
  endDate: string
  timezone: string
  venue: EventVenue
  status: EventStatus
  visibility: EventVisibility
  capacity: number
  registeredCount: number
  organizerId: string
  organizer?: User
  categories: string[]
  tags: string[]
  ticketTypes: TicketType[]
  settings: EventSettings
  createdAt: string
  updatedAt: string
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
  virtualUrl?: string
  virtualPlatform?: string
}

export interface TicketType {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  quantity: number
  soldCount: number
  maxPerOrder: number
  salesStart: string
  salesEnd: string
  status: 'available' | 'sold_out' | 'expired' | 'hidden'
}

export interface EventSettings {
  requireApproval: boolean
  allowWaitlist: boolean
  showAttendeeCount: boolean
  enableCheckIn: boolean
  enableNotifications: boolean
  customFields?: EventCustomField[]
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
  shortDescription?: string
  coverImage?: string
  startDate: string
  endDate: string
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
  startDate?: string
  endDate?: string
  organizerId?: string
}

export interface EventStats {
  totalRegistrations: number
  checkedIn: number
  ticketsSold: number
  revenue: number
  pageViews: number
  conversionRate: number
}

export function isEventLive(event: Event): boolean {
  const now = new Date()
  const start = new Date(event.startDate)
  const end = new Date(event.endDate)
  return now >= start && now <= end && event.status === 'published'
}

export function isEventUpcoming(event: Event): boolean {
  const now = new Date()
  const start = new Date(event.startDate)
  return now < start && event.status === 'published'
}

export function isEventPast(event: Event): boolean {
  const now = new Date()
  const end = new Date(event.endDate)
  return now > end
}

export function getEventCapacityPercentage(event: Event): number {
  if (event.capacity === 0) return 0
  return Math.round((event.registeredCount / event.capacity) * 100)
}
