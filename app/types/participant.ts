import type { User } from './user'
import type { TicketType } from './event'

export interface Participant {
  id: string
  event_id: string
  user_id?: string
  user?: User
  first_name: string
  last_name: string
  email: string
  phone?: string
  ticket: ParticipantTicket
  status: ParticipantStatus
  registered_at: string
  checked_in_at?: string
  checked_out_at?: string
  custom_fields?: Record<string, unknown>
  notes?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export type ParticipantStatus = 'registered' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'

export interface ParticipantTicket {
  id: string
  ticket_type: TicketType
  ticket_number: string
  qr_code: string
  price: number
  currency: string
  payment_status: PaymentStatus
  purchased_at: string
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'free'

export interface Registration {
  id: string
  event_id: string
  user_id?: string
  ticket_type_id: string
  quantity: number
  total_amount: number
  currency: string
  payment_method?: string
  payment_status: PaymentStatus
  participants: Participant[]
  created_at: string
  updated_at: string
}

/** Flatten API event registration list into rows for attendee UIs. */
export function flattenParticipantsFromRegistrations(registrations: Registration[]): Participant[] {
  const list: Participant[] = []
  for (const r of registrations) {
    if (r.participants?.length) {
      list.push(...r.participants)
    }
  }
  return list
}

export interface ParticipantCreateInput {
  event_id: string
  ticket_type_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  custom_fields?: Record<string, unknown>
}

export interface ParticipantUpdateInput {
  first_name?: string
  last_name?: string
  phone?: string
  status?: ParticipantStatus
  custom_fields?: Record<string, unknown>
  notes?: string
  tags?: string[]
}

export interface ParticipantFilters {
  event_id?: string
  status?: ParticipantStatus
  ticket_type_id?: string
  search?: string
  checked_in?: boolean
  date_from?: string
  date_to?: string
}

export interface ParticipantStats {
  total: number
  confirmed: number
  checked_in: number
  cancelled: number
  no_show: number
  revenue: number
}

export function getParticipantFullName(participant: Pick<Participant, 'first_name' | 'last_name'>): string {
  return `${participant.first_name} ${participant.last_name}`.trim()
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
