import { watch, type Ref } from 'vue'

const STORAGE_PREFIX = 'kc_attendee_booking_v1:'

export interface PersistedAttendeeSlot {
  attendee_name: string
  attendee_email: string
  attendee_phone?: string | null
}

export interface PersistedBookingState {
  quantities: Record<string, number>
  attendees: PersistedAttendeeSlot[]
  saved_at: number
}

export function bookingSessionStorageKey(eventId: string): string {
  return `${STORAGE_PREFIX}${eventId}`
}

export function loadBookingSession(eventId: string): PersistedBookingState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(bookingSessionStorageKey(eventId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedBookingState
    if (!parsed || typeof parsed !== 'object') return null
    if (!parsed.quantities || typeof parsed.quantities !== 'object') return null
    if (!Array.isArray(parsed.attendees)) return null
    return parsed
  }
  catch {
    return null
  }
}

export function saveBookingSession(eventId: string, state: Omit<PersistedBookingState, 'saved_at'>): void {
  if (typeof window === 'undefined') return
  try {
    const payload: PersistedBookingState = {
      ...state,
      saved_at: Date.now(),
    }
    sessionStorage.setItem(bookingSessionStorageKey(eventId), JSON.stringify(payload))
  }
  catch {
    /* quota / private mode */
  }
}

export function clearBookingSession(eventId: string): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(bookingSessionStorageKey(eventId))
  }
  catch {
    /* ignore */
  }
}

/** Persist booking selections whenever eventId or refs change (debounced via flush sync). */
export function watchPersistBookingSession(
  eventIdRef: Ref<string>,
  getState: () => Omit<PersistedBookingState, 'saved_at'>,
): () => void {
  return watch(
    [
      eventIdRef,
      () => JSON.stringify(getState().quantities),
      () => JSON.stringify(getState().attendees),
    ],
    () => {
      const id = eventIdRef.value
      if (!id) return
      saveBookingSession(id, getState())
    },
    { deep: true },
  )
}
