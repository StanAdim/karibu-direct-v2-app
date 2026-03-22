import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  NormalizedAppError,
  RegisterForEventPayload,
  Registration,
  RegistrationCheckInPayload,
  RegistrationTicket
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
