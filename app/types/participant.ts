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
  /** Source registration when row is derived from organizer registration list */
  registration_id?: string
  confirmation_code?: string
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
  quantity?: number
  total_amount?: number
  currency?: string
  payment_method?: string
  payment_status?: PaymentStatus
  /** Nested holders (checkout flows); organizer list endpoint omits this. */
  participants?: Participant[]
  created_at: string
  updated_at: string
  /** Registration lifecycle — maps to `RegistrationStatus` from API */
  status?: string
  ticket_number?: string
  confirmation_code?: string
  checked_in?: boolean
  checked_in_at?: string | null
  user_name?: string | null
  user_email?: string | null
  event_title?: string | null
}

export type OrganizerTicketTypeSource = {
  id: string
  name: string
  description?: string | null
  price: number
  currency: string
  quantity: number
  max_per_order: number
  sales_start?: string | null
  sales_end?: string | null
  status: string
}

export function organizerTicketSourceToEventTicketType(source: OrganizerTicketTypeSource): TicketType {
  const st = String(source.status ?? '')
  let status: TicketType['status'] = 'available'
  if (st === 'sold_out')
    status = 'sold_out'
  else if (st === 'expired')
    status = 'expired'
  else if (st === 'hidden' || st === 'unavailable')
    status = 'hidden'

  return {
    id: source.id,
    name: source.name,
    description: source.description ?? '',
    price: source.price,
    currency: source.currency,
    quantity: source.quantity,
    sold_count: 0,
    max_per_order: source.max_per_order,
    sales_start: source.sales_start ?? '',
    sales_end: source.sales_end ?? '',
    status
  }
}

function stubEventTicketType(id: string): TicketType {
  return {
    id,
    name: 'Ticket type',
    description: '',
    price: 0,
    currency: 'USD',
    quantity: 0,
    sold_count: 0,
    max_per_order: 10,
    sales_start: '',
    sales_end: '',
    status: 'available'
  }
}

function splitFullName(name: string | null | undefined): { first_name: string; last_name: string } {
  const n = String(name ?? '').trim()
  if (!n)
    return { first_name: '', last_name: '' }
  const parts = n.split(/\s+/).filter(Boolean)
  if (parts.length === 1)
    return { first_name: parts[0]!, last_name: '' }
  return { first_name: parts[0]!, last_name: parts.slice(1).join(' ') }
}

function mapApiRegistrationToParticipantStatus(reg: Registration): ParticipantStatus {
  if (reg.checked_in)
    return 'checked_in'
  const s = String(reg.status ?? 'confirmed').toLowerCase()
  if (s === 'cancelled')
    return 'cancelled'
  if (s === 'pending')
    return 'registered'
  if (s === 'checked_in')
    return 'checked_in'
  return 'confirmed'
}

function mapApiRegistrationToPaymentStatus(reg: Registration, ticketPrice: number): PaymentStatus {
  const s = String(reg.status ?? '').toLowerCase()
  if (s === 'pending')
    return 'pending'
  if (s === 'cancelled')
    return 'refunded'
  if (ticketPrice <= 0)
    return 'free'
  return 'completed'
}

/**
 * Build one attendee row from organizer `GET /registrations/event/:eventId` items
 * (flat RegistrationDetailResponse — no nested participants).
 */
export function participantFromOrganizerRegistration(
  reg: Registration,
  ticketTypesById?: Map<string, TicketType>
): Participant {
  const tt = ticketTypesById?.get(reg.ticket_type_id) ?? stubEventTicketType(reg.ticket_type_id)
  const { first_name, last_name } = splitFullName(reg.user_name)
  const email = String(reg.user_email ?? '').trim() || 'unknown@attendee.local'

  return {
    id: `${reg.id}-attendee`,
    event_id: reg.event_id,
    user_id: reg.user_id,
    first_name: first_name || 'Guest',
    last_name,
    email,
    ticket: {
      id: reg.id,
      ticket_type: tt,
      ticket_number: reg.ticket_number || reg.id,
      qr_code: reg.confirmation_code ?? '',
      price: tt.price,
      currency: tt.currency,
      payment_status: mapApiRegistrationToPaymentStatus(reg, tt.price),
      purchased_at: reg.created_at,
    },
    status: mapApiRegistrationToParticipantStatus(reg),
    registered_at: reg.created_at,
    checked_in_at: reg.checked_in_at ?? undefined,
    created_at: reg.created_at,
    updated_at: reg.updated_at,
    registration_id: reg.id,
    confirmation_code: reg.confirmation_code,
  }
}

/** Flatten registrations into attendee rows (nested participants or organizer flat list). */
export function flattenParticipantsFromRegistrations(
  registrations: Registration[],
  ticketTypesById?: Map<string, TicketType>
): Participant[] {
  const list: Participant[] = []
  for (const r of registrations) {
    if (r.participants?.length) {
      list.push(...r.participants)
      continue
    }
    list.push(participantFromOrganizerRegistration(r, ticketTypesById))
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
