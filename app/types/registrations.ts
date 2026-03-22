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

/** POST /registrations/checkin */
export interface RegistrationCheckInPayload {
  registration_id?: string
  qr_code?: string
  event_id?: string
  checkpoint_id?: string
}

export type RegistrationTicket = Ticket
