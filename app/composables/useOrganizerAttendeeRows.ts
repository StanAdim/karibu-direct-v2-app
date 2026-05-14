import { computed, type Ref } from 'vue'
import type { Participant, Registration } from '~/types'
import {
  flattenParticipantsFromRegistrations,
  organizerTicketSourceToEventTicketType
} from '~/types'
import type { TicketType as EventTicketType } from '~/types/event'
import type { TicketType as OrganizerTicketTypeRow } from '~/stores/ticket_types'

/**
 * Maps organizer ticket-type rows + event registrations into attendee table rows.
 * Registration list items from the API are flat (no nested `participants`).
 */
export function useOrganizerAttendeeRows(
  registrations: Ref<Registration[]>,
  organizerTicketTypes: Ref<OrganizerTicketTypeRow[]>
) {
  const ticketTypeMap = computed(() => {
    const m = new Map<string, EventTicketType>()
    for (const t of organizerTicketTypes.value) {
      if (!t.id)
        continue
      m.set(t.id, organizerTicketSourceToEventTicketType(t))
    }
    return m
  })

  const attendees = computed<Participant[]>(() =>
    flattenParticipantsFromRegistrations(registrations.value, ticketTypeMap.value)
  )

  return { attendees, ticketTypeMap }
}
