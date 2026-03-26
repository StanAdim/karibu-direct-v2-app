<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import AppModal from '~/components/common/AppModal.vue'
import AppButton from '~/components/ui/AppButton.vue'
import type { TicketType, TicketTypeStatus, TicketTypeUpsertInput } from '~/stores/ticket_types'

const props = defineProps<{
  modelValue: boolean
  data?: TicketType | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: [payload: TicketTypeUpsertInput]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const isEditing = computed(() => Boolean(props.data?.id))

type FormState = {
  name: string
  description: string
  price: number
  currency: string
  quantity: number
  max_per_order: number
  sales_start: string
  sales_end: string
  status: TicketTypeStatus
}

const form = reactive<FormState>({
  name: '',
  description: '',
  price: 0,
  currency: 'TZS',
  quantity: 0,
  max_per_order: 10,
  sales_start: '',
  sales_end: '',
  status: 'available'
})

const errors = reactive<Record<string, string>>({})

const statusOptions: Array<{ value: TicketTypeStatus; label: string }> = [
  { value: 'available', label: 'Available' },
  { value: 'unavailable', label: 'Unavailable' },
  { value: 'sold_out', label: 'Sold out' },
  { value: 'hidden', label: 'Hidden' }
]

function isoToLocalInput(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function localInputToIso(value: string): string | null {
  const v = value.trim()
  if (!v) return null
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function setFormFromData(data?: TicketType | null) {
  form.name = data?.name ?? ''
  form.description = data?.description ?? ''
  form.price = typeof data?.price === 'number' ? data.price : Number(data?.price ?? 0)
  form.currency = data?.currency ?? 'TZS'
  form.quantity = typeof data?.quantity === 'number' ? data.quantity : Number(data?.quantity ?? 0)
  form.max_per_order = typeof data?.max_per_order === 'number' ? data.max_per_order : Number(data?.max_per_order ?? 10)
  form.sales_start = isoToLocalInput(data?.sales_start ?? null)
  form.sales_end = isoToLocalInput(data?.sales_end ?? null)
  form.status = (data?.status as TicketTypeStatus) ?? 'available'
}

watch(
  () => props.modelValue,
  open => {
    if (open) {
      setFormFromData(props.data ?? null)
      Object.keys(errors).forEach(k => delete errors[k])
    }
  }
)

watch(
  () => props.data?.id,
  () => {
    if (props.modelValue) setFormFromData(props.data ?? null)
  }
)

function validate(): boolean {
  const next: Record<string, string> = {}

  if (!form.name.trim()) next.name = 'Name is required'
  if (!form.currency.trim()) next.currency = 'Currency is required'
  if (!Number.isFinite(form.price) || form.price < 0) next.price = 'Price must be 0 or higher'
  if (!Number.isFinite(form.quantity) || form.quantity < 0) next.quantity = 'Quantity must be 0 or higher'
  if (!Number.isFinite(form.max_per_order) || form.max_per_order < 1) next.max_per_order = 'Max per order must be at least 1'

  const startIso = localInputToIso(form.sales_start)
  const endIso = localInputToIso(form.sales_end)
  if (startIso && endIso) {
    if (new Date(startIso).getTime() > new Date(endIso).getTime()) {
      next.sales_end = 'Sales end must be after sales start'
    }
  }

  Object.assign(errors, next)
  Object.keys(errors).forEach((k) => {
    if (!next[k]) delete errors[k]
  })

  return Object.keys(next).length === 0
}

function submit() {
  if (!validate()) return

  const payload: TicketTypeUpsertInput = {
    name: form.name.trim(),
    description: form.description.trim() ? form.description.trim() : null,
    price: Number(form.price),
    currency: form.currency.trim().toUpperCase(),
    quantity: Number(form.quantity),
    max_per_order: Number(form.max_per_order),
    sales_start: localInputToIso(form.sales_start),
    sales_end: localInputToIso(form.sales_end),
    status: form.status
  }

  emit('saved', payload)
}

function cancel() {
  emit('update:modelValue', false)
}
</script>

<template>
  <AppModal
    v-model="isOpen"
    max-width="lg"
    align="top"
  >
    <div class="flex max-h-[80vh] flex-col gap-6 overflow-y-auto ">
      <header class="space-y-2">
        <p class="text-sm font-medium uppercase tracking-wide text-primary-600">
          {{ isEditing ? 'Edit Ticket Type' : 'Add Ticket Type' }}
        </p>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {{ isEditing ? 'Update ticket rules & pricing' : 'Create a new ticket type' }}
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Configure sales window, capacity, pricing, and purchase limits.
        </p>
      </header>

      <form
        class="space-y-6 mx-2"
        @submit.prevent="submit"
      >
        <div class="grid gap-5 sm:grid-cols-2">
          <AppInput
            v-model="form.name"
            label="Name"
            placeholder="e.g., Early Bird"
            required
            :error="errors.name"
          />

          <AppSingleSelect
            v-model="form.status"
            label="Status"
            placeholder="Select status"
            :options="statusOptions"
            :show-selected-chip="false"
            class="[&_.ml-1]:text-xs [&_.ml-1]:uppercase [&_.ml-1]:tracking-wide"
          />
        </div>

        <div class="grid gap-5 sm:grid-cols-3">
          <AppInput
            v-model.number="form.price"
            label="Price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            :error="errors.price"
          />

          <AppInput
            v-model="form.currency"
            label="Currency"
            placeholder="TZS"
            :error="errors.currency"
          />

          <AppInput
            v-model.number="form.quantity"
            label="Quantity"
            type="number"
            min="0"
            step="1"
            placeholder="100"
            :error="errors.quantity"
          />
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <AppInput
            v-model="form.sales_start"
            label="Sales start"
            type="datetime-local"
            :error="errors.sales_start"
          />
          <AppInput
            v-model="form.sales_end"
            label="Sales end"
            type="datetime-local"
            :error="errors.sales_end"
          />
        </div>

        <AppInput
          v-model.number="form.max_per_order"
          label="Max per order"
          type="number"
          min="1"
          step="1"
          placeholder="10"
          :error="errors.max_per_order"
        />

        <div class="space-y-2">
          <p class="ml-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Description
          </p>
          <textarea
            v-model="form.description"
            rows="4"
            placeholder="Optional notes displayed on checkout"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div class="flex items-center justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
          <AppButton
            color="neutral"
            size="sm"
            type="button"
            :disabled="props.loading"
            @click="cancel"
          >
            Cancel
          </AppButton>
          <AppButton
            size="sm"
            type="submit"
            :disabled="props.loading"
          >
            {{ props.loading ? 'Saving...' : (isEditing ? 'Update Ticket Type' : 'Create Ticket Type') }}
          </AppButton>
        </div>
      </form>
    </div>
  </AppModal>
</template>

