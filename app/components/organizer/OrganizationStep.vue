<script setup lang="ts">
const wizard = useOrganizerWizardStore()
</script>

<template>
  <div class="space-y-4">
    <div id="wizard-field-organization_name">
      <label
        for="org-name"
        class="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >Organization name *</label>
      <input
        id="org-name"
        v-model="wizard.organization_name"
        type="text"
        autocomplete="organization"
        class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        :class="wizard.fieldErrors.organization_name ? 'border-red-500' : ''"
        :aria-invalid="Boolean(wizard.fieldErrors.organization_name)"
        :aria-describedby="wizard.fieldErrors.organization_name ? 'err-organization_name' : undefined"
        @input="wizard.clearFieldError('organization_name')"
      >
      <p
        v-if="wizard.fieldErrors.organization_name"
        id="err-organization_name"
        class="text-xs text-red-600 mt-1"
      >
        {{ wizard.fieldErrors.organization_name }}
      </p>
    </div>

    <div id="wizard-field-organization_type">
      <label
        for="org-type"
        class="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >Organization type *</label>
      <input
        id="org-type"
        v-model="wizard.organization_type"
        type="text"
        placeholder="e.g. company, NGO"
        class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        :class="wizard.fieldErrors.organization_type ? 'border-red-500' : ''"
        @input="wizard.clearFieldError('organization_type')"
      >
      <p
        v-if="wizard.fieldErrors.organization_type"
        class="text-xs text-red-600 mt-1"
      >
        {{ wizard.fieldErrors.organization_type }}
      </p>
    </div>

    <div id="wizard-field-registration_number">
      <label
        for="reg-no"
        class="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >Registration number *</label>
      <input
        id="reg-no"
        v-model="wizard.registration_number"
        type="text"
        class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono"
        :class="wizard.fieldErrors.registration_number ? 'border-red-500' : ''"
        @input="wizard.clearFieldError('registration_number')"
      >
      <p
        v-if="wizard.fieldErrors.registration_number"
        class="text-xs text-red-600 mt-1"
      >
        {{ wizard.fieldErrors.registration_number }}
      </p>
    </div>

    <div id="wizard-field-tax_number">
      <label
        for="tax"
        class="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >Tax number</label>
      <input
        id="tax"
        v-model="wizard.tax_number"
        type="text"
        class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        @input="wizard.clearFieldError('tax_number')"
      >
    </div>

    <div id="wizard-field-description">
      <label
        for="desc"
        class="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >Description *</label>
      <textarea
        id="desc"
        v-model="wizard.description"
        rows="5"
        class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        :class="wizard.fieldErrors.description ? 'border-red-500' : ''"
        @input="wizard.clearFieldError('description')"
      />
      <p
        v-if="wizard.fieldErrors.description"
        class="text-xs text-red-600 mt-1"
      >
        {{ wizard.fieldErrors.description }}
      </p>
    </div>
  </div>
</template>
