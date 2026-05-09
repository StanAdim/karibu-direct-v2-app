import { defineStore } from 'pinia'
import type {
  ApplicationReviewPayload,
  OrganizationDocumentKind,
  OrganizationProfile,
  OrganizerApplicationAdminDetail,
  OrganizerApplicationLogEntry,
  OrganizerApplicationsPaginationMeta
} from '~/types/organizer'
import { useOrganizerDocumentUpload } from '~/composables/useOrganizerDocumentUpload'
import { unwrapResource } from '~/utils/unwrapApiResource'

type ApiEnvelope<T> = { success?: boolean; data?: T; meta?: Record<string, unknown> }

function parsePagination(meta: Record<string, unknown> | undefined): OrganizerApplicationsPaginationMeta | null {
  const p = meta?.pagination as Record<string, unknown> | undefined
  if (!p) return null
  return {
    total: Number(p.total ?? 0),
    page: Number(p.page ?? 1),
    size: Number(p.size ?? 20),
    total_pages: Number(p.total_pages ?? 1),
    has_next: Boolean(p.has_next),
    has_prev: Boolean(p.has_prev)
  }
}

export const useOrganizerApplicationStore = defineStore('organizerApplication', () => {
  const api = useApi()
  const { uploadDocument: xhrUpload } = useOrganizerDocumentUpload()

  const application = ref<OrganizationProfile | null>(null)
  /** Audit log entries from GET /organizer-applications/me (review actions and comments). */
  const applicationLogs = ref<OrganizerApplicationLogEntry[]>([])
  const mineLoaded = ref(false)
  const loadingMine = ref(false)
  const saving = ref(false)

  const uploadProgress = ref<Partial<Record<OrganizationDocumentKind, number | null>>>({})

  const adminItems = ref<OrganizationProfile[]>([])
  const adminPagination = ref<OrganizerApplicationsPaginationMeta | null>(null)
  const adminLoading = ref(false)
  const adminDetail = ref<OrganizerApplicationAdminDetail | null>(null)
  const adminDetailLoading = ref(false)
  const reviewSubmitting = ref(false)

  const userNameCache = ref<Record<string, string>>({})

  async function fetchMine(): Promise<OrganizationProfile | null> {
    loadingMine.value = true
    try {
      const raw = await api.get<ApiEnvelope<OrganizationProfile>>('/organizer-applications/me', {
        suppressErrorToast: true
      })
      const envelope = raw as ApiEnvelope<OrganizationProfile> & {
        meta?: { logs?: OrganizerApplicationLogEntry[] }
      }
      const data = unwrapResource<OrganizationProfile>(raw)
      application.value = data
      applicationLogs.value = Array.isArray(envelope.meta?.logs) ? envelope.meta.logs : []
      mineLoaded.value = true
      return data
    }
    catch (err: unknown) {
      const code = (err as { statusCode?: number; status?: number })?.statusCode
        ?? (err as { status?: number })?.status
      if (code === 404) {
        application.value = null
        applicationLogs.value = []
        mineLoaded.value = true
        return null
      }
      throw err
    }
    finally {
      loadingMine.value = false
    }
  }

  async function createApplication(body: Record<string, unknown>): Promise<OrganizationProfile> {
    saving.value = true
    try {
      const raw = await api.post<ApiEnvelope<OrganizationProfile>>('/organizer-applications', body)
      const data = unwrapResource<OrganizationProfile>(raw)
      application.value = data
      mineLoaded.value = true
      return data
    }
    finally {
      saving.value = false
    }
  }

  async function updateApplication(body: Record<string, unknown>): Promise<OrganizationProfile> {
    saving.value = true
    try {
      const raw = await api.put<ApiEnvelope<OrganizationProfile>>('/organizer-applications/me', body)
      const data = unwrapResource<OrganizationProfile>(raw)
      application.value = data
      return data
    }
    finally {
      saving.value = false
    }
  }

  async function uploadOrganizerFile(
    file: File,
    kind: OrganizationDocumentKind
  ): Promise<void> {
    uploadProgress.value = { ...uploadProgress.value, [kind]: 0 }
    try {
      await xhrUpload(file, kind, (pct) => {
        uploadProgress.value = { ...uploadProgress.value, [kind]: pct }
      })
      await fetchMine()
    }
    finally {
      const { [kind]: _removed, ...rest } = uploadProgress.value
      void _removed
      uploadProgress.value = rest
    }
  }

  async function fetchAdminList(params: {
    page?: number
    size?: number
    status?: string
    search?: string
  }): Promise<void> {
    adminLoading.value = true
    try {
      const raw = await api.get<ApiEnvelope<OrganizationProfile[]>>('/admin/organizer-applications', {
        params: {
          page: params.page ?? 1,
          size: params.size ?? 20,
          ...(params.status ? { status: params.status } : {}),
          ...(params.search?.trim() ? { search: params.search.trim() } : {})
        }
      })
      const list = (raw as ApiEnvelope<OrganizationProfile[]>)?.data ?? []
      adminItems.value = Array.isArray(list) ? list : []
      adminPagination.value = parsePagination((raw as ApiEnvelope<unknown>).meta)
    }
    finally {
      adminLoading.value = false
    }
  }

  async function fetchAdminDetail(profileId: string): Promise<void> {
    adminDetailLoading.value = true
    try {
      const raw = await api.get<ApiEnvelope<OrganizerApplicationAdminDetail>>(
        `/admin/organizer-applications/${encodeURIComponent(profileId)}`
      )
      adminDetail.value = unwrapResource<OrganizerApplicationAdminDetail>(raw)
    }
    finally {
      adminDetailLoading.value = false
    }
  }

  async function submitAdminReview(
    profileId: string,
    payload: ApplicationReviewPayload
  ): Promise<OrganizationProfile> {
    reviewSubmitting.value = true
    try {
      const raw = await api.patch<ApiEnvelope<OrganizationProfile>>(
        `/admin/organizer-applications/${encodeURIComponent(profileId)}/review`,
        {
          action: payload.action,
          comment: payload.comment ?? null
        }
      )
      const profile = unwrapResource<OrganizationProfile>(raw)
      if (adminDetail.value?.profile.id === profileId) {
        adminDetail.value = {
          ...adminDetail.value,
          profile
        }
      }
      return profile
    }
    finally {
      reviewSubmitting.value = false
    }
  }

  async function resolveUserDisplayName(userId: string): Promise<string> {
    if (userNameCache.value[userId]) {
      return userNameCache.value[userId]
    }
    try {
      const raw = await api.get<unknown>(`/users/${encodeURIComponent(userId)}`, { suppressErrorToast: true })
      const u = unwrapResource<{ first_name?: string; last_name?: string; email?: string }>(raw)
      const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim()
      const label = name || u.email || userId.slice(0, 8)
      userNameCache.value = { ...userNameCache.value, [userId]: label }
      return label
    }
    catch {
      const label = userId.slice(0, 8)
      userNameCache.value = { ...userNameCache.value, [userId]: label }
      return label
    }
  }

  function clearAdminDetail(): void {
    adminDetail.value = null
  }

  return {
    application,
    applicationLogs,
    mineLoaded,
    loadingMine,
    saving,
    uploadProgress,
    adminItems,
    adminPagination,
    adminLoading,
    adminDetail,
    adminDetailLoading,
    reviewSubmitting,
    userNameCache,
    fetchMine,
    createApplication,
    updateApplication,
    uploadOrganizerFile,
    fetchAdminList,
    fetchAdminDetail,
    submitAdminReview,
    resolveUserDisplayName,
    clearAdminDetail
  }
})
