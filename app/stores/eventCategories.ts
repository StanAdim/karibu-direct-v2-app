import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { EventCategory } from '~/types'
import { useApi } from '~/composables/useApi'

function normalizeCategoryItems(list: unknown[]): EventCategory[] {
  const out: EventCategory[] = []
  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const id = o.id != null ? String(o.id) : o.slug != null ? String(o.slug) : ''
    if (!id) continue
    const nameRaw = o.name ?? o.title ?? o.label ?? id
    const slug = o.slug != null ? String(o.slug) : undefined
    out.push({ id, name: String(nameRaw), slug })
  }
  return out
}

function unwrapCategories(raw: unknown): EventCategory[] {
  if (Array.isArray(raw)) return normalizeCategoryItems(raw)
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    if (Array.isArray(o.data)) return normalizeCategoryItems(o.data)
    if (Array.isArray(o.results)) return normalizeCategoryItems(o.results)
  }
  return []
}

export const useEventCategoryStore = defineStore('eventCategories', () => {
  const categories = ref<EventCategory[]>([])
  const selectedCategoryId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<unknown>(null)
  const api = useApi()

  async function fetchCategories(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const raw = await api.get<unknown>('/events/categories/?page=1&size=100', {
        suppressErrorToast: true
      })
      categories.value = unwrapCategories(raw)
    }
    catch (e) {
      error.value = e
      categories.value = []
    }
    finally {
      loading.value = false
    }
  }

  function setCategory(id: string | null): void {
    selectedCategoryId.value = id
  }

  return {
    categories,
    selectedCategoryId,
    loading,
    error,
    fetchCategories,
    setCategory
  }
})
