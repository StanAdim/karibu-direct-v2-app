<script setup lang="ts">
const wizard = useOrganizerWizardStore()

defineProps<{
  useDrill: boolean
}>()
</script>

<template>
  <div class="space-y-4">
    <div id="wizard-field-country">
      <label
        for="country"
        class="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >Country *</label>
      <input
        id="country"
        v-model="wizard.country"
        type="text"
        autocomplete="country-name"
        class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        :class="wizard.fieldErrors.country ? 'border-red-500' : ''"
        @input="wizard.clearFieldError('country')"
      >
      <p
        v-if="wizard.fieldErrors.country"
        class="text-xs text-red-600 mt-1"
      >
        {{ wizard.fieldErrors.country }}
      </p>
    </div>

    <template v-if="useDrill">
      <DrillingLocationSelect />
    </template>

    <template v-else>
      <div id="wizard-field-region">
        <label
          for="region-txt"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >Region</label>
        <input
          id="region-txt"
          v-model="wizard.region_text"
          type="text"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          @input="wizard.clearFieldError('region')"
        >
      </div>
      <div id="wizard-field-district">
        <label
          for="district-txt"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >District</label>
        <input
          id="district-txt"
          v-model="wizard.district_text"
          type="text"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          @input="wizard.clearFieldError('district')"
        >
      </div>
      <div id="wizard-field-ward">
        <label
          for="ward-txt"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >Ward</label>
        <input
          id="ward-txt"
          v-model="wizard.ward_text"
          type="text"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          @input="wizard.clearFieldError('ward')"
        >
      </div>
    </template>

    <div id="wizard-field-address">
      <label
        for="addr"
        class="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >Address *</label>
      <textarea
        id="addr"
        v-model="wizard.address"
        rows="3"
        class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        :class="wizard.fieldErrors.address ? 'border-red-500' : ''"
        @input="wizard.clearFieldError('address')"
      />
      <p
        v-if="wizard.fieldErrors.address"
        class="text-xs text-red-600 mt-1"
      >
        {{ wizard.fieldErrors.address }}
      </p>
    </div>
  </div>
</template>
