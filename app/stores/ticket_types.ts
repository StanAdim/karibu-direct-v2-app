import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { unwrapList, unwrapResource } from '~/utils/unwrapApiResource'

export type TicketTypeStatus = 'available' | 'unavailable' | 'sold_out' | 'hidden' | string

export type TicketType = {
  id: string
  event_id?: string
  name: string
  description?: string | null
  price: number
  currency: string
  quantity: number
  max_per_order: number
  sales_start?: string | null
  sales_end?: string | null
  status: TicketTypeStatus
  deleted_at?: string | null
  created_at?: string
  updated_at?: string
}

export type TicketTypeUpsertInput = {
  name: string
  description?: string | null
  price: number
  currency: string
  quantity: number
  max_per_order: number
  sales_start?: string | null
  sales_end?: string | null
  status: TicketTypeStatus
}

function asTicketType(raw: unknown): TicketType {
  const r = raw as Partial<TicketType> & { id?: string | number }
  return {
    id: String(r.id ?? ''),
    event_id: r.event_id ? String(r.event_id) : undefined,
    name: String(r.name ?? ''),
    description: r.description ?? null,
    price: typeof r.price === 'number' ? r.price : Number(r.price ?? 0),
    currency: String(r.currency ?? 'USD'),
    quantity: typeof r.quantity === 'number' ? r.quantity : Number(r.quantity ?? 0),
    max_per_order: typeof r.max_per_order === 'number' ? r.max_per_order : Number(r.max_per_order ?? 10),
    sales_start: (r.sales_start as string | null | undefined) ?? null,
    sales_end: (r.sales_end as string | null | undefined) ?? null,
    status: (r.status as TicketTypeStatus) ?? 'available',
    deleted_at: (r.deleted_at as string | null | undefined) ?? null,
    created_at: r.created_at,
    updated_at: r.updated_at
  }
}

export const useTicketTypesStore = defineStore('ticket_types', () => {
  const ticketTypeById = ref<Record<string, TicketType>>({})
  const eventTicketTypeIds = ref<Record<string, string[]>>({})
  const loadingList = ref(false)
  const loadingWrite = ref(false)
  const loading = computed(() => loadingList.value || loadingWrite.value)

  const api = useApi()
  let fetchEventTicketTypesSeq = 0

  function mergeTicketTypes(list: TicketType[]): void {
    const next = { ...ticketTypeById.value }
    for (const t of list) {
      if (!t.id) continue
      next[t.id] = t
    }
    ticketTypeById.value = next
  }

  function setEventTicketTypes(eventId: string, list: TicketType[]): void {
    const ids = list.map(t => t.id).filter(Boolean)
    eventTicketTypeIds.value = { ...eventTicketTypeIds.value, [eventId]: ids }
    mergeTicketTypes(list)
  }

  function getEventTicketTypesFromCache(eventId: string): TicketType[] {
    const ids = eventTicketTypeIds.value[eventId] ?? []
    return ids.map(id => ticketTypeById.value[id]).filter(Boolean) as TicketType[]
  }

  async function fetchEventTicketTypes(eventId: string): Promise<TicketType[]> {
    const seq = ++fetchEventTicketTypesSeq
    loadingList.value = true
    try {
      const raw = await api.get<unknown>(`/events/${eventId}/ticket-types`)
      const { data: rows } = unwrapList<unknown>(raw)
      const list = rows.map(asTicketType)

      if (seq !== fetchEventTicketTypesSeq) {
        return getEventTicketTypesFromCache(eventId)
      }

      setEventTicketTypes(eventId, list)
      return list
    }
    finally {
      if (seq === fetchEventTicketTypesSeq) {
        loadingList.value = false
      }
    }
  }

  async function createTicketType(eventId: string, input: TicketTypeUpsertInput): Promise<TicketType> {
    loadingWrite.value = true
    try {
      const raw = await api.post<unknown>(`/events/${eventId}/ticket-types`, input)
      const created = asTicketType(unwrapResource<unknown>(raw))
      mergeTicketTypes([created])

      const existing = eventTicketTypeIds.value[eventId] ?? []
      if (!existing.includes(created.id)) {
        eventTicketTypeIds.value = { ...eventTicketTypeIds.value, [eventId]: [...existing, created.id] }
      }

      return created
    }
    finally {
      loadingWrite.value = false
    }
  }

  async function bulkCreateTicketTypes(eventId: string, inputs: TicketTypeUpsertInput[]): Promise<TicketType[]> {
    loadingWrite.value = true
    try {
      const raw = await api.post<unknown>(`/events/${eventId}/ticket-types/bulk`, { ticket_types: inputs })
      const { data: rows } = unwrapList<unknown>(raw)
      const created = rows.map(asTicketType)
      const existing = eventTicketTypeIds.value[eventId] ?? []
      const nextIds = [...existing]
      for (const t of created) {
        if (t.id && !nextIds.includes(t.id)) nextIds.push(t.id)
      }
      eventTicketTypeIds.value = { ...eventTicketTypeIds.value, [eventId]: nextIds }
      mergeTicketTypes(created)
      return created
    }
    finally {
      loadingWrite.value = false
    }
  }

  async function cloneTicketType(eventId: string, ticketTypeId: string): Promise<TicketType> {
    loadingWrite.value = true
    try {
      const raw = await api.post<unknown>(`/events/${eventId}/ticket-types/${ticketTypeId}/clone`, {})
      const created = asTicketType(unwrapResource<unknown>(raw))
      mergeTicketTypes([created])

      const existing = eventTicketTypeIds.value[eventId] ?? []
      if (!existing.includes(created.id)) {
        eventTicketTypeIds.value = { ...eventTicketTypeIds.value, [eventId]: [...existing, created.id] }
      }

      return created
    }
    finally {
      loadingWrite.value = false
    }
  }

  async function updateTicketType(
    eventId: string,
    ticketTypeId: string,
    input: TicketTypeUpsertInput
  ): Promise<TicketType> {
    const previous = ticketTypeById.value[ticketTypeId]
    if (previous) {
      ticketTypeById.value = { ...ticketTypeById.value, [ticketTypeId]: { ...previous, ...input } }
    }

    loadingWrite.value = true
    try {
      const raw = await api.put<unknown>(`/events/${eventId}/ticket-types/${ticketTypeId}`, input)
      const updated = asTicketType(unwrapResource<unknown>(raw))
      mergeTicketTypes([updated])
      return updated
    }
    catch (e) {
      if (previous) {
        ticketTypeById.value = { ...ticketTypeById.value, [ticketTypeId]: previous }
      }
      throw e
    }
    finally {
      loadingWrite.value = false
    }
  }

  async function deleteTicketType(eventId: string, ticketTypeId: string): Promise<void> {
    const previous = ticketTypeById.value[ticketTypeId]
    if (previous) {
      ticketTypeById.value = {
        ...ticketTypeById.value,
        [ticketTypeId]: { ...previous, deleted_at: new Date().toISOString(), status: previous.status }
      }
    }

    loadingWrite.value = true
    try {
      await api.delete(`/events/${eventId}/ticket-types/${ticketTypeId}`)
      await fetchEventTicketTypes(eventId)
    }
    catch (e) {
      if (previous) {
        ticketTypeById.value = { ...ticketTypeById.value, [ticketTypeId]: previous }
      }
      throw e
    }
    finally {
      loadingWrite.value = false
    }
  }

  function clearEventTicketTypes(eventId: string): void {
    const { [eventId]: _removed, ...rest } = eventTicketTypeIds.value
    eventTicketTypeIds.value = rest
  }

  return {
    ticketTypeById,
    eventTicketTypeIds,
    loadingList,
    loadingWrite,
    loading,
    getEventTicketTypesFromCache,
    fetchEventTicketTypes,
    createTicketType,
    bulkCreateTicketTypes,
    cloneTicketType,
    updateTicketType,
    deleteTicketType,
    clearEventTicketTypes
  }
})

