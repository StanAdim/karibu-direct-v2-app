import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { EventPublicBrowseItem } from '~/types'
import { useApi } from '~/composables/useApi'

function toFiniteNumber(value: unknown, fallback: number): number {
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) ? num : fallback
}

function extractPaginatedRows<T>(raw: unknown): { rows: T[]; meta: unknown } {
  if (Array.isArray(raw)) {
    return { rows: raw as T[], meta: undefined }
  }
  if (raw && typeof raw === 'object') {
    const o = raw as { data?: unknown; meta?: unknown }
    if (Array.isArray(o.data)) {
      return { rows: o.data as T[], meta: o.meta }
    }
  }
  return { rows: [], meta: undefined }
}

function normalizePagedMeta(
  rawMeta: unknown,
  fallback: { total: number; page: number; per_page: number; last_page: number }
): { total: number; page: number; per_page: number; last_page: number } {
  if (!rawMeta || typeof rawMeta !== 'object') {
    return { ...fallback }
  }
  const m = rawMeta as Record<string, unknown>
  const nested = m.pagination as Record<string, unknown> | undefined
  const src = nested && typeof nested === 'object' ? nested : m

  const total = toFiniteNumber(src.total, fallback.total)
  const page = toFiniteNumber(src.page ?? src.current_page, fallback.page)
  const perPage = toFiniteNumber(src.size ?? src.per_page ?? src.perPage, fallback.per_page)

  let lastPage = toFiniteNumber(
    src.last_page ?? src.lastPage ?? src.total_pages,
    fallback.last_page
  )

  if (!Number.isFinite(lastPage) || lastPage < 1) {
    lastPage = Math.max(1, Math.ceil(total / Math.max(perPage, 1)) || 1)
  }

  return {
    total,
    page,
    per_page: perPage,
    last_page: lastPage
  }
}

export interface PublicBrowseQuery {
  page: number
  size: number
  browse_tab: 'popular' | 'upcoming' | 'nearest'
  category_ids?: string[]
  category_id?: string | null
  search?: string
  start_date?: string | undefined
  end_date?: string | undefined
  price_max?: number | null
  location?: string | null
}

export const usePublicEventBrowseStore = defineStore('publicEventBrowse', () => {
  const items = ref<EventPublicBrowseItem[]>([])
  const loading = ref(false)
  const error = ref<unknown>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    per_page: 6,
    last_page: 1
  })
  const api = useApi()

  async function fetchBrowse(q: PublicBrowseQuery): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      params.append('page', String(q.page))
      params.append('size', String(q.size))
      params.append('browse_tab', q.browse_tab)
      const browseCats = (q.category_ids ?? []).filter(Boolean)
      if (browseCats.length) {
        for (const id of browseCats) {
          params.append('category_ids', String(id))
        }
      }
      else if (q.category_id) {
        params.append('category_id', q.category_id)
      }
      if (q.search?.trim()) params.append('search', q.search.trim())
      if (q.start_date) params.append('start_date', q.start_date)
      if (q.end_date) params.append('end_date', q.end_date)
      if (q.price_max != null && q.price_max > 0 && q.price_max < 500) {
        params.append('price_max', String(q.price_max))
      }
      if (q.location?.trim()) params.append('location', q.location.trim())

      const raw = await api.get<unknown>(`/events/public/browse?${params.toString()}`, {
        suppressErrorToast: true
      })

      const { rows, meta } = extractPaginatedRows<EventPublicBrowseItem>(raw)

      items.value = rows

      const fb = {
        total: pagination.value.total,
        page: q.page,
        per_page: q.size,
        last_page: pagination.value.last_page
      }
      pagination.value = normalizePagedMeta(meta, fb)
    }
    catch (e) {
      error.value = e
      items.value = []
    }
    finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    error,
    pagination,
    fetchBrowse
  }
})
