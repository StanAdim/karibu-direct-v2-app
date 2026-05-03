<script setup lang="ts">
/**
 * Drill-down picker for structured profile location (regions → districts → wards).
 */
import type { DrillLocationRow } from '~/types'

const openModel = defineModel<boolean>('open', { default: false })

const profileStore = useUserProfileStore()
const locationStore = useLocationStore()
const notifications = useNotifications()

const draft = reactive({
  region_id: undefined as number | undefined,
  district_id: undefined as number | undefined,
  ward_id: undefined as number | undefined
})

function drillToSelectOptions(rows: DrillLocationRow[]) {
  return rows.map(r => ({
    label: r.name,
    value: String(r.id)
  }))
}

function syncDraftFromProfile(): void {
  draft.region_id = profileStore.location.region_id ?? undefined
  draft.district_id = profileStore.location.district_id ?? undefined
  draft.ward_id = profileStore.location.ward_id ?? undefined
}

function setModalVisibility(value: boolean): void {
  openModel.value = value
}

/** AppSingleSelect uses string values; keep numeric draft in sync. */
const regionSelectModel = computed({
  get: () => (draft.region_id !== undefined ? String(draft.region_id) : null),
  set: (v: string | null) => {
    draft.region_id = v != null ? Number(v) : undefined
  }
})

const districtSelectModel = computed({
  get: () => (draft.district_id !== undefined ? String(draft.district_id) : null),
  set: (v: string | null) => {
    draft.district_id = v != null ? Number(v) : undefined
  }
})

const wardSelectModel = computed({
  get: () => (draft.ward_id !== undefined ? String(draft.ward_id) : null),
  set: (v: string | null) => {
    draft.ward_id = v != null ? Number(v) : undefined
  }
})

watch(
  openModel,
  async val => {
    if (!val) return
    syncDraftFromProfile()
    await locationStore.fetchRegions(false)
  },
)

watch(
  () => draft.region_id,
  async (next, prev) => {
    if (prev !== undefined && next !== prev) {
      draft.district_id = undefined
      draft.ward_id = undefined
      locationStore.wards = []
    }
    await locationStore.fetchDistricts(next ?? null)
  },
)

watch(
  () => draft.district_id,
  async (next, prev) => {
    if (prev !== undefined && next !== prev) {
      draft.ward_id = undefined
    }
    await locationStore.fetchWards(next ?? null)
  },
)

async function onSave(): Promise<void> {
  if (draft.region_id === undefined) {
    notifications.error({
      title: 'Region required',
      description: 'Choose a region at minimum.',
    })
    return
  }
  const ok = await profileStore.updateLocation({
    region_id: draft.region_id,
    district_id: draft.district_id ?? null,
    ward_id: draft.ward_id ?? null,
  })
  if (ok) {
    openModel.value = false
    await locationStore.hydrateNamesForProfile(profileStore.location)
  }
}

function onCancel(): void {
  syncDraftFromProfile()
  openModel.value = false
}
</script>

<template>
  <AppModal
    :model-value="openModel"
    max-width="sm"
    align="top"
    @update:model-value="setModalVisibility"
  >
    <div class="space-y-5 pr-8">
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Update location
        </h3>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Select region, district, and ward using the hierarchical location catalogue.
        </p>
      </div>

      <AppSingleSelect
        v-model="regionSelectModel"
        label="Region (required)"
        placeholder="Choose a region"
        :options="drillToSelectOptions(locationStore.regions)"
        :disabled="locationStore.loading"
        :show-selected-chip="false"
      />

      <AppSingleSelect
        v-model="districtSelectModel"
        label="District"
        placeholder="Choose a district"
        :options="drillToSelectOptions(locationStore.districts)"
        :disabled="locationStore.loadingDistricts || draft.region_id === undefined"
        :show-selected-chip="false"
      />

      <AppSingleSelect
        v-model="wardSelectModel"
        label="Ward"
        placeholder="Choose a ward"
        :options="drillToSelectOptions(locationStore.wards)"
        :disabled="locationStore.loadingWards || draft.district_id === undefined"
        :show-selected-chip="false"
      />

      <div class="flex justify-end gap-3 pt-2">
        <AppButton color="neutral" type="button" @click="onCancel">
          Cancel
        </AppButton>
        <AppButton type="button" :disabled="profileStore.saving" @click="onSave">
          {{ profileStore.saving ? 'Saving…' : 'Save location' }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
