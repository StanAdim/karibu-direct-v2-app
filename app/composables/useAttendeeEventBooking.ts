import { computed } from 'vue'
import type { Event, TicketType } from '~/types'
import { unwrapResource } from '~/utils/unwrapApiResource'

export interface AttendeeSlotInput {
  attendee_name: string
  attendee_email: string
  attendee_phone?: string
}

function newSlotFromUser(user: { first_name?: string | null; last_name?: string | null; email?: string | null; phone?: string | null } | null): AttendeeSlotInput {
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim()
  return {
    attendee_name: name || 'Guest',
    attendee_email: user?.email?.trim() || '',
    attendee_phone: user?.phone?.trim() || '',
  }
}

export function resizeAttendeeSlots(
  current: AttendeeSlotInput[],
  nextLen: number,
  user: AttendeeSlotInput,
): AttendeeSlotInput[] {
  const out = current.slice(0, nextLen)
  while (out.length < nextLen) {
    out.push({ ...user })
  }
  return out
}

/** Ticket types that can still be sold (inventory + status), excluding sales window — caller passes `now`. */
export function filterPurchasableTicketTypes(types: TicketType[], now: Date): TicketType[] {
  return types.filter((t) => {
    if (t.status !== 'available') return false
    const sold = t.sold_count || 0
    const reserved = t.reserved_count || 0
    const remaining = Math.max(0, t.quantity - sold - reserved)
    if (remaining <= 0) return false
    const start = new Date(t.sales_start)
    const end = new Date(t.sales_end)
    return now >= start && now <= end
  })
}

export function remainingForTicket(t: TicketType): number {
  const sold = t.sold_count || 0
  const reserved = t.reserved_count || 0
  return Math.max(0, t.quantity - sold - reserved)
}

export function maxSelectableForTicket(t: TicketType): number {
  const remaining = remainingForTicket(t)
  const cap = Math.min(t.max_per_order || remaining, remaining)
  return Math.max(0, cap)
}

/** Expansion order follows `orderedTypes` (UI order). */
export function expandTicketLines(
  orderedTypes: TicketType[],
  quantities: Record<string, number>,
): { ticket_type_id: string; quantity: number }[] {
  const lines: { ticket_type_id: string; quantity: number }[] = []
  for (const tt of orderedTypes) {
    const q = Math.max(0, Math.floor(Number(quantities[tt.id] ?? 0)))
    if (q > 0) lines.push({ ticket_type_id: tt.id, quantity: q })
  }
  return lines
}

export function totalQuantity(lines: { quantity: number }[]): number {
  return lines.reduce((acc, l) => acc + l.quantity, 0)
}

/** Build attendee array ordered to match checkout `items` expansion (same as backend loop). */
export function attendeesForCheckoutLines(
  lines: { ticket_type_id: string; quantity: number }[],
  attendees: AttendeeSlotInput[],
): AttendeeSlotInput[] {
  const need = totalQuantity(lines)
  const slice = attendees.slice(0, need)
  while (slice.length < need) {
    slice.push({ attendee_name: 'Guest', attendee_email: '', attendee_phone: '' })
  }
  return slice.map(row => ({
    attendee_name: row.attendee_name.trim(),
    attendee_email: row.attendee_email.trim(),
    attendee_phone: row.attendee_phone?.trim() ? row.attendee_phone.trim() : undefined,
  }))
}

export function cartHasFreeAndPaid(
  lines: { ticket_type_id: string; quantity: number }[],
  typesById: Map<string, TicketType>,
): { freeLines: typeof lines; paidLines: typeof lines; hasMixed: boolean } {
  const freeLines: typeof lines = []
  const paidLines: typeof lines = []
  for (const line of lines) {
    const tt = typesById.get(line.ticket_type_id)
    const price = tt ? Number(tt.price) : 0
    if (price <= 0) freeLines.push(line)
    else paidLines.push(line)
  }
  const hasMixed = freeLines.length > 0 && paidLines.length > 0
  return { freeLines, paidLines, hasMixed }
}

export function subtotalForLines(
  lines: { ticket_type_id: string; quantity: number }[],
  typesById: Map<string, TicketType>,
): number {
  let sum = 0
  for (const line of lines) {
    const tt = typesById.get(line.ticket_type_id)
    if (!tt) continue
    sum += Number(tt.price) * line.quantity
  }
  return sum
}

/** Paid ticket lines only (excludes free ticket rows). */
export function subtotalPaidOnly(
  lines: { ticket_type_id: string; quantity: number }[],
  typesById: Map<string, TicketType>,
): number {
  let sum = 0
  for (const line of lines) {
    const tt = typesById.get(line.ticket_type_id)
    if (!tt || Number(tt.price) <= 0) continue
    sum += Number(tt.price) * line.quantity
  }
  return sum
}

function randomIdempotencyKey(): string {
  try {
    return globalThis.crypto?.randomUUID?.() ?? `idem_${Date.now()}_${Math.random().toString(36).slice(2)}`
  }
  catch {
    return `idem_${Date.now()}_${Math.random().toString(36).slice(2)}`
  }
}

export interface SubmitBookingResult {
  kind: 'free_done' | 'checkout_redirect'
  orderId?: string
}

export async function submitEventBooking(args: {
  api: ReturnType<typeof useApi>
  event: Event
  orderedTypes: TicketType[]
  quantities: Record<string, number>
  attendees: AttendeeSlotInput[]
}): Promise<SubmitBookingResult> {
  const { api, event, orderedTypes, quantities, attendees } = args
  const lines = expandTicketLines(orderedTypes, quantities).filter(l => l.quantity > 0)
  if (lines.length === 0) {
    throw new Error('Select at least one ticket')
  }

  const typesById = new Map(event.ticket_types.map(t => [t.id, t]))

  for (const line of lines) {
    const tt = typesById.get(line.ticket_type_id)
    if (!tt) throw new Error('Invalid ticket selection')
    const maxSel = maxSelectableForTicket(tt)
    if (line.quantity > maxSel) throw new Error(`Quantity exceeds availability for ${tt.name}`)
  }

  const normalizedAttendees = attendeesForCheckoutLines(lines, attendees)
  for (const row of normalizedAttendees) {
    if (!row.attendee_name.trim()) throw new Error('Each attendee needs a name')
    if (!row.attendee_email.trim()) throw new Error('Each attendee needs an email')
  }

  let attendeeIdx = 0
  const paidLinesAccum: typeof lines = []
  const paidAttendeesOrdered: AttendeeSlotInput[] = []

  for (const line of lines) {
    const tt = typesById.get(line.ticket_type_id)!
    const chunk = normalizedAttendees.slice(attendeeIdx, attendeeIdx + line.quantity)
    attendeeIdx += line.quantity

    if (Number(tt.price) <= 0) {
      await api.post(`/events/${event.id}/register-free`, {
        ticket_type_id: tt.id,
        attendees: chunk.map(a => ({
          attendee_name: a.attendee_name,
          attendee_email: a.attendee_email,
          attendee_phone: a.attendee_phone,
        })),
      })
    }
    else {
      paidLinesAccum.push(line)
      paidAttendeesOrdered.push(...chunk)
    }
  }

  if (paidLinesAccum.length === 0) {
    return { kind: 'free_done' }
  }

  const raw = await api.post(`/events/${event.id}/checkout`, {
    items: paidLinesAccum.map(l => ({ ticket_type_id: l.ticket_type_id, quantity: l.quantity })),
    attendees: paidAttendeesOrdered.map(a => ({
      attendee_name: a.attendee_name,
      attendee_email: a.attendee_email,
      attendee_phone: a.attendee_phone,
    })),
    idempotency_key: randomIdempotencyKey(),
  })
  const body = unwrapResource<{ order?: { id: string } }>(raw)
  const oid = body?.order?.id
  if (!oid) throw new Error('Checkout did not return an order id')
  return { kind: 'checkout_redirect', orderId: oid }
}

export function useAttendeeEventBookingPrefill() {
  const { user } = useAuth()
  return {
    defaultSlot: computed(() => newSlotFromUser(user.value)),
  }
}

export { newSlotFromUser }
