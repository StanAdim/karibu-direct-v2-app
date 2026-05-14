import type { Ticket } from './ticket'

/** POST /registrations/ */
export interface RegisterForEventPayload {
  event_id: string
  ticket_type_id: string
  quantity?: number
  payment_method?: string
  participants?: {
    first_name: string
    last_name: string
    email: string
    phone?: string
  }[]
}

/** POST /registrations/checkin — matches API CheckInRequest */
export interface RegistrationCheckInPayload {
  qr_token?: string
  ticket_number?: string
  confirmation_code?: string
}

export type RegistrationTicket = Ticket
