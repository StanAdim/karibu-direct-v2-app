import type { Event } from './event'
import type { User } from './user'

export interface Ticket {
  id: string
  ticketNumber: string
  eventId: string
  event?: Event
  userId: string
  user?: User
  ticketTypeId: string
  ticketTypeName: string
  qrCode: string
  status: TicketStatus
  price: number
  currency: string
  purchasedAt: string
  validFrom: string
  validUntil: string
  checkedInAt?: string
  transferredFrom?: string
  createdAt: string
  updatedAt: string
}

export type TicketStatus = 'valid' | 'used' | 'expired' | 'cancelled' | 'transferred'

export interface TicketTransfer {
  id: string
  ticketId: string
  fromUserId: string
  toUserId: string
  toEmail: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  transferredAt?: string
  expiresAt: string
  createdAt: string
}

export interface TicketPurchase {
  eventId: string
  ticketTypeId: string
  quantity: number
  buyerInfo: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  attendees?: {
    firstName: string
    lastName: string
    email: string
  }[]
  paymentMethodId?: string
  promoCode?: string
}

export interface TicketFilters {
  eventId?: string
  status?: TicketStatus
  userId?: string
  search?: string
  purchasedFrom?: string
  purchasedTo?: string
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
  const validFrom = new Date(ticket.validFrom)
  const validUntil = new Date(ticket.validUntil)
  return now >= validFrom && now <= validUntil
}
