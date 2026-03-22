import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  Checkpoint,
  CheckpointCreateInput,
  CheckpointScan,
  CheckpointScanPayload,
  CheckpointUpdateInput,
  NormalizedAppError
} from '~/types'
import { useApi } from '~/composables/useApi'
import { normalizeFetchError } from '~/utils/normalizeFetchError'
import { unwrapList, unwrapResource } from '~/utils/unwrapApiResource'

const SCAN_DEBOUNCE_MS = 800

export const useCheckpointStore = defineStore('checkpoint', () => {
  const api = useApi()

  /** Normalized map for O(1) access */
  const checkpointById = ref<Record<string, Checkpoint>>({})
  /** Checkpoints grouped by event (server order preserved per fetch). */
  const checkpointIdsByEvent = ref<Record<string, string[]>>({})
  const currentCheckpoint = ref<Checkpoint | null>(null)
  const lastScanResult = ref<CheckpointScan | null>(null)

  const loadingEventCheckpoints = ref(false)
  const loadingCheckpoint = ref(false)
  const loadingWrite = ref(false)
  const loadingScan = ref(false)

  const error = ref<NormalizedAppError | null>(null)

  const loading = computed(
    () =>
      loadingEventCheckpoints.value
      || loadingCheckpoint.value
      || loadingWrite.value
      || loadingScan.value
  )

  let fetchEventSeq = 0
  let lastScanKey = ''
  let lastScanAt = 0
  let inFlightScan: Promise<CheckpointScan | null> | null = null

  function setError(err: unknown | null): void {
    error.value = err ? normalizeFetchError(err) : null
  }

  function mergeCheckpoints(eventId: string, list: Checkpoint[]): void {
    const ids: string[] = []
    const byId = { ...checkpointById.value }
    for (const c of list) {
      ids.push(c.id)
      byId[c.id] = c
    }
    checkpointById.value = byId
    checkpointIdsByEvent.value = {
      ...checkpointIdsByEvent.value,
      [eventId]: ids
    }
  }

  function eventCheckpoints(eventId: string): Checkpoint[] {
    const ids = checkpointIdsByEvent.value[eventId] ?? []
    return ids.map(id => checkpointById.value[id]).filter(Boolean) as Checkpoint[]
  }

  async function fetchEventCheckpoints(eventId: string): Promise<Checkpoint[]> {
    const seq = ++fetchEventSeq
    loadingEventCheckpoints.value = true
    setError(null)
    try {
      const raw = await api.get<unknown>(`/checkpoints/event/${eventId}`)
      if (seq !== fetchEventSeq) {
        return eventCheckpoints(eventId)
      }
      const { data } = unwrapList<Checkpoint>(raw)
      mergeCheckpoints(eventId, data)
      return data
    }
    catch (e) {
      setError(e)
      throw e
    }
    finally {
      if (seq === fetchEventSeq) {
        loadingEventCheckpoints.value = false
      }
    }
  }

  async function createCheckpoint(payload: CheckpointCreateInput): Promise<Checkpoint> {
    loadingWrite.value = true
    setError(null)
    try {
      const raw = await api.post<unknown>('/checkpoints/', payload)
      const created = unwrapResource<Checkpoint>(raw)
      checkpointById.value = { ...checkpointById.value, [created.id]: created }
      const existing = checkpointIdsByEvent.value[payload.event_id] ?? []
      checkpointIdsByEvent.value = {
        ...checkpointIdsByEvent.value,
        [payload.event_id]: [...existing, created.id]
      }
      return created
    }
    catch (e) {
      setError(e)
      throw e
    }
    finally {
      loadingWrite.value = false
    }
  }

  async function fetchCheckpoint(id: string): Promise<Checkpoint | null> {
    loadingCheckpoint.value = true
    setError(null)
    try {
      const raw = await api.get<unknown>(`/checkpoints/${id}`)
      const cp = unwrapResource<Checkpoint>(raw)
      currentCheckpoint.value = cp
      checkpointById.value = { ...checkpointById.value, [cp.id]: cp }
      return cp
    }
    catch (e) {
      setError(e)
      currentCheckpoint.value = null
      return null
    }
    finally {
      loadingCheckpoint.value = false
    }
  }

  async function updateCheckpoint(id: string, payload: CheckpointUpdateInput): Promise<Checkpoint> {
    loadingWrite.value = true
    setError(null)
    try {
      const raw = await api.put<unknown>(`/checkpoints/${id}`, payload)
      const updated = unwrapResource<Checkpoint>(raw)
      checkpointById.value = { ...checkpointById.value, [updated.id]: updated }
      if (currentCheckpoint.value?.id === id) {
        currentCheckpoint.value = updated
      }
      return updated
    }
    catch (e) {
      setError(e)
      throw e
    }
    finally {
      loadingWrite.value = false
    }
  }

  async function deleteCheckpoint(id: string): Promise<void> {
    const existing = checkpointById.value[id]
    loadingWrite.value = true
    setError(null)
    try {
      await api.delete(`/checkpoints/${id}`)
      const { [id]: _removed, ...rest } = checkpointById.value
      checkpointById.value = rest
      if (existing) {
        const evId = existing.event_id
        const ids = (checkpointIdsByEvent.value[evId] ?? []).filter(x => x !== id)
        checkpointIdsByEvent.value = { ...checkpointIdsByEvent.value, [evId]: ids }
      }
      if (currentCheckpoint.value?.id === id) {
        currentCheckpoint.value = null
      }
    }
    catch (e) {
      setError(e)
      throw e
    }
    finally {
      loadingWrite.value = false
    }
  }

  /**
   * Debounces identical payloads and collapses parallel scans to a single request.
   * Returns null when the call was deduplicated (UI can ignore or show no-op).
   */
  async function scanCheckpoint(payload: CheckpointScanPayload): Promise<CheckpointScan | null> {
    const key = JSON.stringify(payload)
    const now = Date.now()

    if (inFlightScan && key === lastScanKey) {
      return inFlightScan
    }

    if (key === lastScanKey && now - lastScanAt < SCAN_DEBOUNCE_MS) {
      return Promise.resolve(null)
    }

    lastScanKey = key
    lastScanAt = now
    loadingScan.value = true
    setError(null)

    const run = (async () => {
      try {
        const raw = await api.post<unknown>('/checkpoints/scan', payload, {
          retry: { attempts: 3, delayMs: 400 }
        })
        const scan = unwrapResource<CheckpointScan>(raw)
        lastScanResult.value = scan
        return scan
      }
      catch (e) {
        setError(e)
        lastScanResult.value = null
        throw e
      }
      finally {
        loadingScan.value = false
        inFlightScan = null
      }
    })()

    inFlightScan = run
    return run
  }

  function clearCurrent(): void {
    currentCheckpoint.value = null
    lastScanResult.value = null
    setError(null)
  }

  function invalidateEvent(eventId: string): void {
    const ids = checkpointIdsByEvent.value[eventId] ?? []
    const { [eventId]: _removed, ...restEvents } = checkpointIdsByEvent.value
    checkpointIdsByEvent.value = restEvents
    const nextById = { ...checkpointById.value }
    for (const id of ids) {
      delete nextById[id]
    }
    checkpointById.value = nextById
  }

  return {
    checkpointById,
    checkpointIdsByEvent,
    currentCheckpoint,
    lastScanResult,
    loadingEventCheckpoints,
    loadingCheckpoint,
    loadingWrite,
    loadingScan,
    loading,
    error,
    eventCheckpoints,
    fetchEventCheckpoints,
    createCheckpoint,
    fetchCheckpoint,
    updateCheckpoint,
    deleteCheckpoint,
    scanCheckpoint,
    clearCurrent,
    invalidateEvent
  }
})
