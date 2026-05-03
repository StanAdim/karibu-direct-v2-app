import { reactive, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import type { DrillLocationRow, ProfileGeoIds } from '~/types/location'
import { useApi } from '~/composables/useApi'

function unwrapDrill(raw: unknown): DrillLocationRow[] {
  const r = raw as DrillLocationRow[] | { data?: DrillLocationRow[] }
  return Array.isArray(r) ? r : (Array.isArray(r.data) ? r.data : [])
}

export const useLocationStore = defineStore('location', () => {
  const api = useApi()

  const regions = shallowRef<DrillLocationRow[]>([])
  const districts = shallowRef<DrillLocationRow[]>([])
  const wards = shallowRef<DrillLocationRow[]>([])

  const loading = ref(false)

  const loadingDistricts = ref(false)
  const loadingWards = ref(false)

  const districtsCache = reactive<Record<number, DrillLocationRow[]>>({})
  const wardsCache = reactive<Record<number, DrillLocationRow[]>>({})
  const nameCache = reactive<Record<number, string>>({})

  function memorizeRows(rows: DrillLocationRow[]): void {
    for (const row of rows) {
      nameCache[row.id] = row.name
    }
  }

  async function fetchRegions(force = false): Promise<void> {
    if (!force && regions.value.length > 0) return
    loading.value = true
    try {
      const raw = await api.get<unknown>('/locations/drill', {
        params: { level: 'region' }
      })
      regions.value = unwrapDrill(raw)
      memorizeRows(regions.value)
    }
    finally {
      loading.value = false
    }
  }

  async function fetchDistricts(regionId: number | null | undefined): Promise<void> {
    wards.value = []
    if (!regionId) {
      districts.value = []
      return
    }
    loadingDistricts.value = true
    try {
      if (districtsCache[regionId]) {
        districts.value = districtsCache[regionId]
        memorizeRows(districts.value)
        return
      }
      const raw = await api.get<unknown>('/locations/drill', {
        params: { parent_id: regionId }
      })
      const rows = unwrapDrill(raw)
      districtsCache[regionId] = rows
      districts.value = rows
      memorizeRows(rows)
    }
    finally {
      loadingDistricts.value = false
    }
  }

  async function fetchWards(districtId: number | null | undefined): Promise<void> {
    if (!districtId) {
      wards.value = []
      return
    }
    loadingWards.value = true
    try {
      if (wardsCache[districtId]) {
        wards.value = wardsCache[districtId]
        memorizeRows(wards.value)
        return
      }
      const raw = await api.get<unknown>('/locations/drill', {
        params: { parent_id: districtId }
      })
      const rows = unwrapDrill(raw)
      wardsCache[districtId] = rows
      wards.value = rows
      memorizeRows(rows)
    }
    finally {
      loadingWards.value = false
    }
  }

  /** Ensure label cache is warm for persisted profile FKs (profile page summary). */
  async function hydrateNamesForProfile(ids: ProfileGeoIds): Promise<void> {
    await fetchRegions(false)
    if (ids.region_id != null)
      await fetchDistricts(ids.region_id)
    if (ids.district_id != null)
      await fetchWards(ids.district_id)
    memorizeRows(regions.value)
    memorizeRows(districts.value)
    memorizeRows(wards.value)
  }

  function profileGeoLabel(ids: ProfileGeoIds): string {
    const segments: string[] = []
    if (ids.region_id != null && nameCache[ids.region_id]) segments.push(nameCache[ids.region_id])
    if (ids.district_id != null && nameCache[ids.district_id])
      segments.push(nameCache[ids.district_id])
    if (ids.ward_id != null && nameCache[ids.ward_id]) segments.push(nameCache[ids.ward_id])
    return segments.length > 0 ? segments.join(' / ') : ''
  }

  return {
    regions,
    districts,
    wards,
    loading,
    loadingDistricts,
    loadingWards,
    fetchRegions,
    fetchDistricts,
    fetchWards,
    hydrateNamesForProfile,
    profileGeoLabel,
    nameCache,
    memorizeRows
  }
})
