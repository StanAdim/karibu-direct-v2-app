<script setup lang="ts">
import type { DrillLocationRow } from '~/types/location'

const wizard = useOrganizerWizardStore()
const locationStore = useLocationStore()
const notifications = useNotifications()

function drillToOptions(rows: DrillLocationRow[]) {
  return rows.map(r => ({ label: r.name, value: String(r.id) }))
}

const regionModel = computed({
  get: () => (wizard.region_id != null ? String(wizard.region_id) : null),
  set: (v: string | null) => {
    const next = v != null ? Number(v) : null
    if (next !== wizard.region_id) {
      wizard.region_id = next
      wizard.district_id = null
      wizard.ward_id = null
      locationStore.wards = []
    }
  }
})

const districtModel = computed({
  get: () => (wizard.district_id != null ? String(wizard.district_id) : null),
  set: (v: string | null) => {
    const next = v != null ? Number(v) : null
    if (next !== wizard.district_id) {
      wizard.district_id = next
      wizard.ward_id = null
    }
  }
})

const wardModel = computed({
  get: () => (wizard.ward_id != null ? String(wizard.ward_id) : null),
  set: (v: string | null) => {
    wizard.ward_id = v != null ? Number(v) : null
  }
})

onMounted(async () => {
  try {
    await locationStore.fetchRegions(false)
  }
  catch {
    notifications.error({
      title: 'Locations unavailable',
      description: 'Could not load regions. Check your connection and try again.'
    })
  }
})

watch(
  () => wizard.region_id,
  async (id) => {
    if (id == null) {
      locationStore.districts = []
      locationStore.wards = []
      return
    }
    try {
      await locationStore.fetchDistricts(id)
    }
    catch {
      notifications.error({ title: 'Could not load districts' })
    }
  },
  { immediate: true }
)

watch(
  () => wizard.district_id,
  async (id) => {
    if (id == null) {
      locationStore.wards = []
      return
    }
    try {
      await locationStore.fetchWards(id)
    }
    catch {
      notifications.error({ title: 'Could not load wards' })
    }
  },
  { immediate: true }
)

const regionOpts = computed(() => drillToOptions(locationStore.regions))
const districtOpts = computed(() => drillToOptions(locationStore.districts))
const wardOpts = computed(() => drillToOptions(locationStore.wards))
</script>

<template>
  <div class="space-y-4">
    <AppSingleSelect
      v-model="regionModel"
      label="Region *"
      :options="regionOpts"
      :disabled="locationStore.loading"
      :searchable="regionOpts.length > 8"
      placeholder="Select region"
      :error="wizard.fieldErrors.region_id"
    />

    <AppSingleSelect
      v-model="districtModel"
      label="District *"
      :options="districtOpts"
      :disabled="!wizard.region_id || locationStore.loadingDistricts"
      :searchable="districtOpts.length > 8"
      placeholder="Select district"
      :error="wizard.fieldErrors.district_id"
    />

    <AppSingleSelect
      v-model="wardModel"
      label="Ward *"
      :options="wardOpts"
      :disabled="!wizard.district_id || locationStore.loadingWards"
      :searchable="wardOpts.length > 8"
      placeholder="Select ward"
      :error="wizard.fieldErrors.ward_id"
    />
    <p
      v-if="locationStore.loadingWards"
      class="text-xs text-slate-500 -mt-2"
    >
      Loading wards…
    </p>
  </div>
</template>
