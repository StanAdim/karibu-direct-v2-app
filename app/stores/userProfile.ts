import { nextTick, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import type { ProfileBundlePayload, ProfileGeoIds, User } from '~/types'
import { useApi } from '~/composables/useApi'

/** Backend may wrap resources as `{ success, data: T }` or `{ data: T }`. */
function unwrapResource<T>(raw: unknown): T {
  return (raw as { data?: T })?.data ?? (raw as T)
}

function replaceRecord(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const k of Object.keys(target)) delete target[k]
  Object.assign(target, source)
}

export const useUserProfileStore = defineStore('userProfile', () => {
  const api = useApi()
  const authStore = useAuthStore()

  const profile = reactive({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    avatar_url: '' as string | undefined
  })

  const location = reactive<ProfileGeoIds>({
    region_id: null,
    district_id: null,
    ward_id: null
  })

  const preferences = reactive({
    event_reminders: true,
    marketing_notifications: false
  })

  const additional_info = reactive<Record<string, unknown>>({})

  const stats = reactive({
    events_attended: 0
  })

  const loading = ref(false)
  const saving = ref(false)
  const savingPreferences = ref(false)
  const error = ref<string | null>(null)

  const preferencesHydrated = ref(false)

  let prefsDebounceTimer: ReturnType<typeof setTimeout> | null = null

  const toast = useNotifications()

  function applyBundle(bundle: ProfileBundlePayload): void {
    Object.assign(profile, {
      id: bundle.profile.id,
      first_name: bundle.profile.first_name,
      last_name: bundle.profile.last_name,
      email: bundle.profile.email,
      phone_number: bundle.profile.phone_number ?? '',
      avatar_url: bundle.profile.avatar_url ?? undefined
    })

    location.region_id =
      bundle.profile.region_id ?? null
    location.district_id =
      bundle.profile.district_id ?? null
    location.ward_id =
      bundle.profile.ward_id ?? null

    preferences.event_reminders = bundle.preferences.event_reminders
    preferences.marketing_notifications = bundle.preferences.marketing_notifications
    replaceRecord(additional_info, bundle.additional_info ?? {})
    stats.events_attended = bundle.stats?.events_attended ?? 0
  }

  function mergeAuthFromProfile(bundle: ProfileBundlePayload): void {
    const prev = authStore.user
    if (!prev) return
    const p = bundle.profile
    const merged: User = {
      ...prev,
      email: p.email ?? prev.email,
      first_name: p.first_name,
      last_name: p.last_name,
      phone: p.phone_number || undefined,
      avatar: p.avatar_url || prev.avatar
    }
    authStore.setUser(merged)
  }

  function buildPutBody(options: { includeAdditionalInfo?: boolean } = {}): Record<string, unknown> {
    const body: Record<string, unknown> = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone_number: profile.phone_number || null,
      region_id: location.region_id,
      district_id: location.district_id,
      ward_id: location.ward_id
    }
    if (
      options.includeAdditionalInfo
      && Object.keys(additional_info).length > 0
    ) {
      body.additional_info = { ...additional_info }
    }
    return body
  }

  async function fetchProfile(): Promise<void> {
    loading.value = true
    error.value = null
    preferencesHydrated.value = false
    try {
      const raw = await api.get<unknown>('/profile')
      const data = unwrapResource<ProfileBundlePayload>(raw)
      applyBundle(data)
      await nextTick()
      preferencesHydrated.value = true
    }
    catch (err: unknown) {
      preferencesHydrated.value = true
      const msg = err instanceof Error ? err.message : 'Unable to load profile'
      error.value = msg
    }
    finally {
      loading.value = false
    }
  }

  /** PUT profile payload (personal info + structured location + optional additional_info). */
  async function updateProfile(options?: {
    toastTitle?: string
    includeAdditionalInfo?: boolean
  }): Promise<boolean> {
    saving.value = true
    error.value = null
    try {
      const raw = await api.put<unknown>(
        '/profile',
        buildPutBody({ includeAdditionalInfo: options?.includeAdditionalInfo ?? true }),
      )
      const data = unwrapResource<ProfileBundlePayload>(raw)
      applyBundle(data)
      mergeAuthFromProfile(data)
      toast.success({
        title:
          options?.toastTitle ?? 'Profile updated successfully',
      })
      return true
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Update failed'
      return false
    }
    finally {
      saving.value = false
    }
  }

  /**
   * Persist structured location FKs without touching ``additional_info``.
   * Applies server response via ``applyBundle`` on success.
   */
  async function updateLocation(next: ProfileGeoIds): Promise<boolean> {
    saving.value = true
    error.value = null
    try {
      const raw = await api.put<unknown>('/profile', {
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number || null,
        region_id: next.region_id,
        district_id: next.district_id,
        ward_id: next.ward_id,
      })
      const data = unwrapResource<ProfileBundlePayload>(raw)
      applyBundle(data)
      mergeAuthFromProfile(data)
      toast.success({ title: 'Location saved', description: 'Your structured location has been updated.' })
      return true
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Update failed'
      return false
    }
    finally {
      saving.value = false
    }
  }

  async function putPreferencesToServer(): Promise<boolean> {
    savingPreferences.value = true
    error.value = null
    try {
      const raw = await api.put<unknown>('/profile/preferences', {
        event_reminders: preferences.event_reminders,
        marketing_notifications: preferences.marketing_notifications
      })
      const updated = unwrapResource<ProfileBundlePayload['preferences']>(raw)
      preferences.event_reminders = updated.event_reminders
      preferences.marketing_notifications = updated.marketing_notifications
      toast.success({
        title: 'Preferences saved',
        description: 'Your notification settings were updated.'
      })
      return true
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Preference update failed'
      return false
    }
    finally {
      savingPreferences.value = false
    }
  }

  function schedulePreferenceSave(): void {
    if (!preferencesHydrated.value) return
    if (prefsDebounceTimer) clearTimeout(prefsDebounceTimer)
    prefsDebounceTimer = setTimeout(() => {
      prefsDebounceTimer = null
      void putPreferencesToServer()
    }, 450)
  }

  function onPreferenceFieldChange(): void {
    schedulePreferenceSave()
  }

  async function updatePreferences(
    payload?: Partial<Pick<typeof preferences, 'event_reminders' | 'marketing_notifications'>>
  ): Promise<boolean> {
    if (payload) {
      if (typeof payload.event_reminders === 'boolean') {
        preferences.event_reminders = payload.event_reminders
      }
      if (typeof payload.marketing_notifications === 'boolean') {
        preferences.marketing_notifications = payload.marketing_notifications
      }
    }
    if (prefsDebounceTimer) {
      clearTimeout(prefsDebounceTimer)
      prefsDebounceTimer = null
    }
    return putPreferencesToServer()
  }

  async function uploadAvatar(file: File): Promise<boolean> {
    saving.value = true
    error.value = null
    const form = new FormData()
    form.append('file', file)
    try {
      type AvatarResp = { avatar_url?: string }
      const raw = await api.post<unknown>('/profile/avatar', form)
      const data = unwrapResource<AvatarResp>(raw)
      if (data?.avatar_url) {
        profile.avatar_url = data.avatar_url
      }
      if (authStore.user) {
        authStore.setUser({
          ...authStore.user,
          avatar: profile.avatar_url || authStore.user.avatar
        })
      }
      toast.success({ title: 'Photo updated', description: 'Your profile picture was uploaded.' })
      return true
    }
    catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Upload failed'
      return false
    }
    finally {
      saving.value = false
    }
  }

  return {
    profile,
    location,
    preferences,
    additional_info,
    stats,
    loading,
    saving,
    savingPreferences,
    error,
    fetchProfile,
    updateProfile,
    updateLocation,
    updatePreferences,
    onPreferenceFieldChange,
    uploadAvatar
  }
})
