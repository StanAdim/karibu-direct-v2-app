<script setup lang="ts">
import type { OrganizerApplicationFormState } from '~/types/organizer'

const props = defineProps<{
  modelValue: OrganizerApplicationFormState
  step: number
  errors: Record<string, string>
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [v: OrganizerApplicationFormState]
}>()

function patch<K extends keyof OrganizerApplicationFormState>(
  key: K,
  value: OrganizerApplicationFormState[K]
): void {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const v = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Step 1 -->
    <div
      v-show="step === 1"
      class="space-y-4"
    >
      <div>
        <label
          for="org-name"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >Organization name *</label>
        <input
          id="org-name"
          :value="v.organization_name"
          type="text"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          :disabled="disabled"
          @input="patch('organization_name', ($event.target as HTMLInputElement).value)"
        >
        <p
          v-if="errors.organization_name"
          class="text-xs text-red-600 mt-1"
        >
          {{ errors.organization_name }}
        </p>
      </div>
      <div>
        <label
          for="org-type"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >Organization type *</label>
        <input
          id="org-type"
          :value="v.organization_type"
          type="text"
          placeholder="e.g. company, NGO"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          :disabled="disabled"
          @input="patch('organization_type', ($event.target as HTMLInputElement).value)"
        >
        <p
          v-if="errors.organization_type"
          class="text-xs text-red-600 mt-1"
        >
          {{ errors.organization_type }}
        </p>
      </div>
      <div>
        <label
          for="reg-no"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >Registration number *</label>
        <input
          id="reg-no"
          :value="v.registration_number"
          type="text"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono"
          :disabled="disabled"
          @input="patch('registration_number', ($event.target as HTMLInputElement).value)"
        >
        <p
          v-if="errors.registration_number"
          class="text-xs text-red-600 mt-1"
        >
          {{ errors.registration_number }}
        </p>
      </div>
      <div>
        <label
          for="tax"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >Tax number</label>
        <input
          id="tax"
          :value="v.tax_number"
          type="text"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          :disabled="disabled"
          @input="patch('tax_number', ($event.target as HTMLInputElement).value)"
        >
      </div>
      <div>
        <label
          for="desc"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >Description *</label>
        <textarea
          id="desc"
          :value="v.description"
          rows="5"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          :disabled="disabled"
          @input="patch('description', ($event.target as HTMLTextAreaElement).value)"
        />
        <p
          v-if="errors.description"
          class="text-xs text-red-600 mt-1"
        >
          {{ errors.description }}
        </p>
      </div>
    </div>

    <!-- Step 2 -->
    <div
      v-show="step === 2"
      class="space-y-4"
    >
      <div>
        <label
          for="phone"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >Phone *</label>
        <input
          id="phone"
          :value="v.phone_number"
          type="tel"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          :disabled="disabled"
          @input="patch('phone_number', ($event.target as HTMLInputElement).value)"
        >
        <p
          v-if="errors.phone_number"
          class="text-xs text-red-600 mt-1"
        >
          {{ errors.phone_number }}
        </p>
      </div>
      <div>
        <label
          for="email"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >Email *</label>
        <input
          id="email"
          :value="v.email"
          type="email"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          :disabled="disabled"
          @input="patch('email', ($event.target as HTMLInputElement).value)"
        >
        <p
          v-if="errors.email"
          class="text-xs text-red-600 mt-1"
        >
          {{ errors.email }}
        </p>
      </div>
      <div>
        <label
          for="web"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >Website</label>
        <input
          id="web"
          :value="v.website"
          type="url"
          placeholder="https://example.com"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          :disabled="disabled"
          @input="patch('website', ($event.target as HTMLInputElement).value)"
        >
        <p
          v-if="errors.website"
          class="text-xs text-red-600 mt-1"
        >
          {{ errors.website }}
        </p>
      </div>
    </div>

    <!-- Step 3 -->
    <div
      v-show="step === 3"
      class="space-y-4"
    >
      <div>
        <label
          for="country"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >Country *</label>
        <input
          id="country"
          :value="v.country"
          type="text"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          :disabled="disabled"
          @input="patch('country', ($event.target as HTMLInputElement).value)"
        >
        <p
          v-if="errors.country"
          class="text-xs text-red-600 mt-1"
        >
          {{ errors.country }}
        </p>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Region</label>
          <input
            :value="v.region"
            type="text"
            class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            :disabled="disabled"
            @input="patch('region', ($event.target as HTMLInputElement).value)"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">District</label>
          <input
            :value="v.district"
            type="text"
            class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            :disabled="disabled"
            @input="patch('district', ($event.target as HTMLInputElement).value)"
          >
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Ward</label>
        <input
          :value="v.ward"
          type="text"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          :disabled="disabled"
          @input="patch('ward', ($event.target as HTMLInputElement).value)"
        >
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
        <textarea
          :value="v.address"
          rows="3"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          :disabled="disabled"
          @input="patch('address', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>
    </div>
  </div>
</template>
