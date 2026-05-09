import { defineStore } from 'pinia'
import type { OrganizationProfile, OrganizerApplicationLogEntry, OrganizationDocumentKind } from '~/types/organizer'
import { useOrganizerWorkspaceUpload } from '~/composables/useOrganizerWorkspaceUpload'
import { unwrapResource } from '~/utils/unwrapApiResource'

type ApiEnvelope<T> = { success?: boolean; data?: T; meta?: Record<string, unknown> }

export type OrganizerDashboardSummary = {
  totalEvents: number
  upcomingEvents: number
  draftEvents: number
  publishedEvents: number
  archivedEvents: number
  ticketsSold: number
  revenueDisplay: string
  pendingCheckIns: number
  orgStatusLabel: string
}

export const useOrganizerWorkspaceStore = defineStore('organizerWorkspace', () => {
  const api = useApi()
  const { uploadWorkspaceAsset } = useOrganizerWorkspaceUpload()

  const profile = ref<OrganizationProfile | null>(null)
  const workspaceLogs = ref<OrganizerApplicationLogEntry[]>([])
  const loadingProfile = ref(false)
  const profileLoaded = ref(false)
  const savingProfile = ref(false)
  const uploadProgress = ref<Partial<Record<OrganizationDocumentKind, number | null>>>({})
  const dashboardSummary = ref<OrganizerDashboardSummary | null>(null)
  const loadingDashboard = ref(false)

  async function fetchProfile(): Promise<OrganizationProfile | null> {
    loadingProfile.value = true
    try {
      const raw = await api.get<ApiEnvelope<OrganizationProfile>>('/organizer/profile', {
        suppressErrorToast: true
      })
      const envelope = raw as ApiEnvelope<OrganizationProfile> & {
        meta?: { logs?: OrganizerApplicationLogEntry[] }
      }
      const data = unwrapResource<OrganizationProfile>(raw)
      profile.value = data
      workspaceLogs.value = Array.isArray(envelope.meta?.logs) ? envelope.meta.logs : []
      profileLoaded.value = true
      return data
    }
    catch (err: unknown) {
      const code = (err as { statusCode?: number; status?: number })?.statusCode
        ?? (err as { status?: number })?.status
      if (code === 404) {
        profile.value = null
        workspaceLogs.value = []
        profileLoaded.value = true
        return null
      }
      throw err
    }
    finally {
      loadingProfile.value = false
    }
  }

  function mergeProfilePatch(patch: Partial<OrganizationProfile>): void {
    if (!profile.value) return
    profile.value = { ...profile.value, ...patch }
  }

  async function updateProfile(body: Record<string, unknown>): Promise<OrganizationProfile> {
    savingProfile.value = true
    try {
      const raw = await api.put<ApiEnvelope<OrganizationProfile>>('/organizer/profile', body)
      const data = unwrapResource<OrganizationProfile>(raw)
      profile.value = data
      return data
    }
    finally {
      savingProfile.value = false
    }
  }

  async function uploadAsset(
    file: File,
    kind: OrganizationDocumentKind
  ): Promise<void> {
    uploadProgress.value = { ...uploadProgress.value, [kind]: 0 }
    try {
      await uploadWorkspaceAsset(file, kind, (pct) => {
        uploadProgress.value = { ...uploadProgress.value, [kind]: pct }
      })
      await fetchProfile()
    }
    finally {
      const { [kind]: _removed, ...rest } = uploadProgress.value
      void _removed
      uploadProgress.value = rest
    }
  }

  async function refreshDashboardSummary(): Promise<void> {
    const eventsStore = useEventsStore()
    loadingDashboard.value = true
    try {
      eventsStore.setPage(1)
      eventsStore.setPerPage(100)
      await eventsStore.fetchMyEvents({})

      const rows = eventsStore.events
      const now = Date.now()
      const upcoming = rows.filter((e) => {
        try {
          return new Date(e.start_date).getTime() >= now && e.status !== 'cancelled'
        }
        catch {
          return false
        }
      })

      const draft = rows.filter(e => e.status === 'draft')
      const published = rows.filter(e => e.status === 'published')
      const archived = rows.filter(e => e.status === 'completed' || e.status === 'cancelled')

      let tickets = 0
      for (const e of rows) {
        const n = (e as { registered_count?: number }).registered_count
        if (typeof n === 'number' && Number.isFinite(n)) tickets += n
      }

      dashboardSummary.value = {
        totalEvents: rows.length,
        upcomingEvents: upcoming.length,
        draftEvents: draft.length,
        publishedEvents: published.length,
        archivedEvents: archived.length,
        ticketsSold: tickets,
        revenueDisplay: '—',
        pendingCheckIns: 0,
        orgStatusLabel: profile.value?.status === 'APPROVED' ? 'Verified organizer' : (profile.value?.status ?? '—')
      }
    }
    finally {
      loadingDashboard.value = false
    }
  }

  function reset(): void {
    profile.value = null
    workspaceLogs.value = []
    profileLoaded.value = false
    dashboardSummary.value = null
  }

  return {
    profile,
    workspaceLogs,
    loadingProfile,
    profileLoaded,
    savingProfile,
    uploadProgress,
    dashboardSummary,
    loadingDashboard,
    fetchProfile,
    updateProfile,
    mergeProfilePatch,
    uploadAsset,
    refreshDashboardSummary,
    reset
  }
})
