<script setup lang="ts">
const wizard = useOrganizerWizardStore()
</script>

<template>
  <div class="space-y-4">
    <div id="wizard-field-phone_number">
      <label
        for="phone"
        class="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >Phone *</label>
      <input
        id="phone"
        v-model="wizard.phone_number"
        type="tel"
        autocomplete="tel"
        class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        :class="wizard.fieldErrors.phone_number ? 'border-red-500' : ''"
        @input="wizard.clearFieldError('phone_number')"
      >
      <p
        v-if="wizard.fieldErrors.phone_number"
        class="text-xs text-red-600 mt-1"
      >
        {{ wizard.fieldErrors.phone_number }}
      </p>
    </div>

    <div id="wizard-field-email">
      <label
        for="email"
        class="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >Email *</label>
      <input
        id="email"
        v-model="wizard.email"
        type="email"
        autocomplete="email"
        class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        :class="wizard.fieldErrors.email ? 'border-red-500' : ''"
        @input="wizard.clearFieldError('email')"
      >
      <p
        v-if="wizard.fieldErrors.email"
        class="text-xs text-red-600 mt-1"
      >
        {{ wizard.fieldErrors.email }}
      </p>
    </div>

    <div id="wizard-field-website">
      <label
        for="web"
        class="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >Website</label>
      <input
        id="web"
        v-model="wizard.website"
        type="url"
        autocomplete="url"
        placeholder="https://example.com"
        class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        :class="wizard.fieldErrors.website ? 'border-red-500' : ''"
        @input="wizard.clearFieldError('website')"
      >
      <p
        v-if="wizard.fieldErrors.website"
        class="text-xs text-red-600 mt-1"
      >
        {{ wizard.fieldErrors.website }}
      </p>
    </div>
  </div>
</template>
