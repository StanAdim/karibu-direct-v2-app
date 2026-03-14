import type { Event } from './event'
import type { User } from './user'

export interface Ticket {
  id: string
  ticket_number: string
  event_id: string
  event?: Event
  user_id: string
  user?: User
  ticket_type_id: string
  ticket_type_name: string
  qr_code: string
  status: TicketStatus
  price: number
  currency: string
  purchased_at: string
  valid_from: string
  valid_until: string
  checked_in_at?: string
  transferred_from?: string
  created_at: string
  updated_at: string
}

export type TicketStatus = 'valid' | 'used' | 'expired' | 'cancelled' | 'transferred'

export interface TicketTransfer {
  id: string
  ticket_id: string
  from_user_id: string
  to_user_id: string
  to_email: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  transferred_at?: string
  expires_at: string
  created_at: string
}

export interface TicketPurchase {
  event_id: string
  ticket_type_id: string
  quantity: number
  buyer_info: {
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
  attendees?: {
    first_name: string
    last_name: string
    email: string
  }[]
  payment_method_id?: string
  promo_code?: string
}

export interface TicketFilters {
  event_id?: string
  status?: TicketStatus
  user_id?: string
  search?: string
  purchased_from?: string
  purchased_to?: string
}

export function getTicketStatusColor(status: TicketStatus): string {
  const colors: Record<TicketStatus, string> = {
    valid: 'success',
    used: 'neutral',
    expired: 'warning',
    cancelled: 'error',
    transferred: 'info'
  }
  return colors[status]
}

export function getTicketStatusLabel(status: TicketStatus): string {
  const labels: Record<TicketStatus, string> = {
    valid: 'Valid',
    used: 'Used',
    expired: 'Expired',
    cancelled: 'Cancelled',
    transferred: 'Transferred'
  }
  return labels[status]
}

export function isTicketValid(ticket: Ticket): boolean {
  if (ticket.status !== 'valid') return false
  const now = new Date()
  const validFrom = new Date(ticket.valid_from)
  const validUntil = new Date(ticket.valid_until)
  return now >= validFrom && now <= validUntil
}
