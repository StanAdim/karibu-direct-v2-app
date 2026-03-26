import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  NormalizedAppError,
  Participant,
  RegisterForEventPayload,
  Registration,
  RegistrationCheckInPayload,
  RegistrationTicket,
  Ticket,
  TicketStatus
} from '~/types'
import { useApi } from '~/composables/useApi'
import { normalizeFetchError } from '~/utils/normalizeFetchError'
import { unwrapList, unwrapResource } from '~/utils/unwrapApiResource'

export const useRegistrationStore = defineStore('registration', () => {
  const api = useApi()

  const registrations = ref<Registration[]>([])
  const eventRegistrations = ref<Registration[]>([])
  const currentRegistration = ref<Registration | null>(null)
  const ticket = ref<RegistrationTicket | null>(null)

  const loadingUserRegistrations = ref(false)
  const loadingEventRegistrations = ref(false)
  const loadingRegistration = ref(false)
  const loadingTicket = ref(false)
  const loadingRegister = ref(false)
  const loadingCheckIn = ref(false)
  const loadingCancel = ref(false)

  const error = ref<NormalizedAppError | null>(null)

  const loading = computed(
    () =>
      loadingUserRegistrations.value
      || loadingEventRegistrations.value
      || loadingRegistration.value
      || loadingTicket.value
      || loadingRegister.value
      || loadingCheckIn.value
      || loadingCancel.value
  )

  function mapParticipantStatusToTicketStatus(status: Participant['status'], validUntil: string): TicketStatus {
    if (status === 'checked_in' || status === 'checked_out') return 'used'
    if (status === 'cancelled' || status === 'no_show') return 'cancelled'
    if (new Date(validUntil) < new Date()) return 'expired'
    return 'valid'
  }

  function asRecord(input: unknown): Record<string, unknown> {
    return (input && typeof input === 'object') ? input as Record<string, unknown> : {}
  }

  function asString(input: unknown): string {
    return typeof input === 'string' ? input : ''
  }

  function asNumber(input: unknown, fallback = 0): number {
    if (typeof input === 'number' && Number.isFinite(input)) return input
    if (typeof input === 'string') {
      const n = Number(input)
      if (Number.isFinite(n)) return n
    }
    return fallback
  }

  function deriveEventDates(registration: Registration): { start: string; end: string } {
    const eventObj = asRecord((registration as Registration & { event?: unknown }).event)
    const start = asString(eventObj.start_date) || asString((registration as Registration & { start_date?: unknown }).start_date)
    const end = asString(eventObj.end_date) || asString((registration as Registration & { end_date?: unknown }).end_date)
    return { start, end }
  }

  function deriveTicketStatusFromFlatRegistration(registration: Registration, validUntil: string): TicketStatus {
    const rawStatus = String((registration as Registration & { status?: unknown }).status || '').toLowerCase()
    if (rawStatus === 'used' || rawStatus === 'checked_in' || rawStatus === 'checked_out') return 'used'
    if (rawStatus === 'cancelled' || rawStatus === 'no_show') return 'cancelled'
    if (rawStatus === 'expired') return 'expired'
    if (new Date(validUntil) < new Date()) return 'expired'
    return 'valid'
  }

  function toUserTicket(registration: Registration, participant: Participant, index: number): Ticket {
    const purchasedAt = participant.ticket?.purchased_at || registration.created_at || new Date().toISOString()
    const { start: eventStart, end: eventEnd } = deriveEventDates(registration)
    const validFrom = eventStart || purchasedAt
    const validUntil = eventEnd || eventStart || new Date(new Date(purchasedAt).getTime() + 86400000 * 3650).toISOString()
    const ticketStatus = mapParticipantStatusToTicketStatus(participant.status, validUntil)

    return {
      id: participant.ticket?.id || `${registration.id}-${index}`,
      ticket_number: participant.ticket?.ticket_number || `${registration.id}-${index + 1}`,
      event_id: registration.event_id,
      event: (registration as Registration & { event?: Ticket['event'] }).event,
      user_id: participant.user_id || registration.user_id || '',
      ticket_type_id: registration.ticket_type_id,
      ticket_type_name: participant.ticket?.ticket_type?.name || 'Ticket',
      qr_code: participant.ticket?.qr_code || '',
      status: ticketStatus,
      price: Number(participant.ticket?.price ?? 0),
      currency: participant.ticket?.currency || registration.currency || 'TZS',
      purchased_at: purchasedAt,
      valid_from: validFrom,
      valid_until: validUntil,
      checked_in_at: participant.checked_in_at || undefined,
      created_at: registration.created_at,
      updated_at: registration.updated_at
    }
  }

  function toUserTicketFromFlatRegistration(registration: Registration): Ticket {
    const reg = asRecord(registration)
    const purchasedAt = asString(reg.purchased_at) || registration.created_at || new Date().toISOString()
    const { start: eventStart, end: eventEnd } = deriveEventDates(registration)
    const validFrom = asString(reg.valid_from) || eventStart || purchasedAt
    const validUntil = asString(reg.valid_until) || eventEnd || eventStart || new Date(new Date(purchasedAt).getTime() + 86400000 * 3650).toISOString()
    const eventObj = asRecord(reg.event)

    return {
      id: asString(reg.ticket_id) || asString(reg.id) || `ticket-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      ticket_number: asString(reg.ticket_number) || asString(reg.registration_number) || asString(reg.id),
      event_id: asString(reg.event_id),
      event: (Object.keys(eventObj).length ? eventObj : undefined) as Ticket['event'],
      user_id: asString(reg.user_id),
      ticket_type_id: asString(reg.ticket_type_id),
      ticket_type_name: asString(reg.ticket_type_name) || asString(reg.ticket_type) || 'Ticket',
      qr_code: asString(reg.qr_code),
      status: deriveTicketStatusFromFlatRegistration(registration, validUntil),
      price: asNumber(reg.price, asNumber(reg.total_amount, 0)),
      currency: asString(reg.currency) || 'TZS',
      purchased_at: purchasedAt,
      valid_from: validFrom,
      valid_until: validUntil,
      checked_in_at: asString(reg.checked_in_at) || undefined,
      created_at: registration.created_at,
      updated_at: registration.updated_at
    }
  }

  const userTickets = computed<Ticket[]>(() => {
    return registrations.value.flatMap((registration) => {
      const participants = registration.participants || []
      if (!participants.length) return [toUserTicketFromFlatRegistration(registration)]
      return participants.map((participant, index) => toUserTicket(registration, participant, index))
    })
  })

  function setError(err: unknown | null): void {
    error.value = err ? normalizeFetchError(err) : null
  }

  async function fetchUserRegistrations(): Promise<Registration[]> {
    loadingUserRegistrations.value = true
    setError(null)
    try {
      const raw = await api.get<unknown>('/registrations/')
      const { data } = unwrapList<Registration>(raw)
      registrations.value = data
      return data
    }
    catch (e) {
      setError(e)
      throw e
    }
    finally {
      loadingUserRegistrations.value = false
    }
  }

  async function registerForEvent(payload: RegisterForEventPayload): Promise<Registration> {
    loadingRegister.value = true
    setError(null)
    try {
      const raw = await api.post<unknown>('/registrations/', payload, {
        retry: { attempts: 2, delayMs: 500 }
      })
      const created = unwrapResource<Registration>(raw)
      registrations.value = [created, ...registrations.value.filter(r => r.id !== created.id)]
      return created
    }
    catch (e) {
      setError(e)
      throw e
    }
    finally {
      loadingRegister.value = false
    }
  }

  async function fetchEventRegistrations(eventId: string): Promise<Registration[]> {
    loadingEventRegistrations.value = true
    setError(null)
    try {
      const raw = await api.get<unknown>(`/registrations/event/${eventId}`)
      const { data } = unwrapList<Registration>(raw)
      eventRegistrations.value = data
      return data
    }
    catch (e) {
      setError(e)
      throw e
    }
    finally {
      loadingEventRegistrations.value = false
    }
  }

  async function fetchRegistration(registrationId: string): Promise<Registration | null> {
    loadingRegistration.value = true
    setError(null)
    try {
      const raw = await api.get<unknown>(`/registrations/${registrationId}`)
      const reg = unwrapResource<Registration>(raw)
      currentRegistration.value = reg
      return reg
    }
    catch (e) {
      setError(e)
      currentRegistration.value = null
      return null
    }
    finally {
      loadingRegistration.value = false
    }
  }

  async function cancelRegistration(registrationId: string): Promise<void> {
    const prevList = registrations.value
    const prevEventList = eventRegistrations.value
    const prevCurrent = currentRegistration.value
    const shouldClearTicket = prevCurrent?.id === registrationId

    registrations.value = registrations.value.filter(r => r.id !== registrationId)
    eventRegistrations.value = eventRegistrations.value.filter(r => r.id !== registrationId)
    if (currentRegistration.value?.id === registrationId) {
      currentRegistration.value = null
    }

    loadingCancel.value = true
    setError(null)
    try {
      await api.delete(`/registrations/${registrationId}`, { suppressErrorToast: true })
      if (shouldClearTicket) {
        ticket.value = null
      }
    }
    catch (e) {
      registrations.value = prevList
      eventRegistrations.value = prevEventList
      currentRegistration.value = prevCurrent
      setError(e)
      const n = normalizeFetchError(e)
      useNotifications().error({ title: 'Could not cancel', description: n.message })
      throw e
    }
    finally {
      loadingCancel.value = false
    }
  }

  async function fetchTicket(registrationId: string): Promise<RegistrationTicket | null> {
    loadingTicket.value = true
    setError(null)
    try {
      const raw = await api.get<unknown>(`/registrations/${registrationId}/ticket`)
      const t = unwrapResource<RegistrationTicket>(raw)
      ticket.value = t
      return t
    }
    catch (e) {
      setError(e)
      ticket.value = null
      return null
    }
    finally {
      loadingTicket.value = false
    }
  }

  async function checkIn(payload: RegistrationCheckInPayload): Promise<unknown> {
    loadingCheckIn.value = true
    setError(null)
    try {
      const result = await api.post<unknown>('/registrations/checkin', payload, {
        retry: { attempts: 3, delayMs: 350 }
      })
      return result
    }
    catch (e) {
      setError(e)
      throw e
    }
    finally {
      loadingCheckIn.value = false
    }
  }

  function clearCurrent(): void {
    currentRegistration.value = null
    ticket.value = null
    setError(null)
  }

  return {
    registrations,
    eventRegistrations,
    currentRegistration,
    ticket,
    loadingUserRegistrations,
    loadingEventRegistrations,
    loadingRegistration,
    loadingTicket,
    loadingRegister,
    loadingCheckIn,
    loadingCancel,
    loading,
    error,
    userTickets,
    fetchUserRegistrations,
    registerForEvent,
    fetchEventRegistrations,
    fetchRegistration,
    cancelRegistration,
    fetchTicket,
    checkIn,
    clearCurrent
  }
})
