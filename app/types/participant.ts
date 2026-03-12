import type { User } from './user'
import type { TicketType } from './event'

export interface Participant {
  id: string
  eventId: string
  userId?: string
  user?: User
  firstName: string
  lastName: string
  email: string
  phone?: string
  ticket: ParticipantTicket
  status: ParticipantStatus
  registeredAt: string
  checkedInAt?: string
  checkedOutAt?: string
  customFields?: Record<string, unknown>
  notes?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export type ParticipantStatus = 'registered' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'

export interface ParticipantTicket {
  id: string
  ticketType: TicketType
  ticketNumber: string
  qrCode: string
  price: number
  currency: string
  paymentStatus: PaymentStatus
  purchasedAt: string
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'free'

export interface Registration {
  id: string
  eventId: string
  userId?: string
  ticketTypeId: string
  quantity: number
  totalAmount: number
  currency: string
  paymentMethod?: string
  paymentStatus: PaymentStatus
  participants: Participant[]
  createdAt: string
  updatedAt: string
}

export interface ParticipantCreateInput {
  eventId: string
  ticketTypeId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  customFields?: Record<string, unknown>
}

export interface ParticipantUpdateInput {
  firstName?: string
  lastName?: string
  phone?: string
  status?: ParticipantStatus
  customFields?: Record<string, unknown>
  notes?: string
  tags?: string[]
}

export interface ParticipantFilters {
  eventId?: string
  status?: ParticipantStatus
  ticketTypeId?: string
  search?: string
  checkedIn?: boolean
  dateFrom?: string
  dateTo?: string
}

export interface ParticipantStats {
  total: number
  confirmed: number
  checkedIn: number
  cancelled: number
  noShow: number
  revenue: number
}

export function getParticipantFullName(participant: Pick<Participant, 'firstName' | 'lastName'>): string {
  return `${participant.firstName} ${participant.lastName}`.trim()
}

export function getStatusColor(status: ParticipantStatus): string {
  const colors: Record<ParticipantStatus, string> = {
    registered: 'info',
    confirmed: 'primary',
    checked_in: 'success',
    checked_out: 'neutral',
    cancelled: 'error',
    no_show: 'warning'
  }
  return colors[status]
}

export function getStatusLabel(status: ParticipantStatus): string {
  const labels: Record<ParticipantStatus, string> = {
    registered: 'Registered',
    confirmed: 'Confirmed',
    checked_in: 'Checked In',
    checked_out: 'Checked Out',
    cancelled: 'Cancelled',
    no_show: 'No Show'
  }
  return labels[status]
}
