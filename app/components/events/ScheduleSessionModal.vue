<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppModal from '~/components/common/AppModal.vue'
import AppButton from '~/components/ui/AppButton.vue'

export interface ScheduleSessionPayload {
  date: string
  startTime: string
  endTime: string
  durationHours: number
  venueBufferMinutes: number
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    eventId?: string
  }>(),
  {}
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [payload: ScheduleSessionPayload]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const calendarMonth = ref(new Date())
const selectedDate = ref(new Date())
const durationHours = ref(2.5)
const startTimeSlot = ref('15:00')
const venueBufferMinutes = ref(30)

const durationOptions = [1, 1.5, 2, 2.5, 3]
const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

const monthLabel = computed(() =>
  calendarMonth.value.toLocaleString('en-US', { month: 'long', year: 'numeric' })
)

const calendarWeeks = computed(() => {
  const year = calendarMonth.value.getFullYear()
  const month = calendarMonth.value.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startPad = (first.getDay() + 6) % 7
  const days: { day: number; date: Date; isCurrentMonth: boolean }[] = []

  for (let i = 0; i < startPad; i++) {
    const d = new Date(year, month, 1 - (startPad - i))
    days.push({ day: d.getDate(), date: d, isCurrentMonth: false })
  }
  for (let d = 1; d <= last.getDate(); d++) {
    days.push({ day: d, date: new Date(year, month, d), isCurrentMonth: true })
  }
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({ day: d.getDate(), date: d, isCurrentMonth: false })
  }

  const weeks: { day: number; date: Date; isCurrentMonth: boolean }[][] = []
  for (let w = 0; w < 6; w++) {
    weeks.push(days.slice(w * 7, (w + 1) * 7))
  }
  return weeks
})

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function prevMonth() {
  calendarMonth.value = new Date(calendarMonth.value.getFullYear(), calendarMonth.value.getMonth() - 1)
}

function nextMonth() {
  calendarMonth.value = new Date(calendarMonth.value.getFullYear(), calendarMonth.value.getMonth() + 1)
}

function selectDay(day: { date: Date; isCurrentMonth: boolean }) {
  selectedDate.value = new Date(day.date)
}

const endTimeComputed = computed(() => {
  const [h, m] = startTimeSlot.value.split(':').map(Number)
  const totalMinutes = h * 60 + m + Math.round(durationHours.value * 60)
  const endH = Math.floor(totalMinutes / 60)
  const endM = totalMinutes % 60
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
})

const slotSummaryDate = computed(() =>
  selectedDate.value.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
)

function isSlotInRange(slot: string): boolean {
  const [sh, sm] = startTimeSlot.value.split(':').map(Number)
  const [eh, em] = endTimeComputed.value.split(':').map(Number)
  const startM = sh * 60 + sm
  const endM = eh * 60 + em
  const [h, m] = slot.split(':').map(Number)
  const slotM = h * 60 + m
  return slotM >= startM && slotM < endM
}

function setDuration(h: number) {
  durationHours.value = h
}

function setStartTime(slot: string) {
  startTimeSlot.value = slot
}

function handleConfirm() {
  const dateStr = selectedDate.value.toISOString().slice(0, 10)
  emit('confirm', {
    date: dateStr,
    startTime: startTimeSlot.value,
    endTime: endTimeComputed.value,
    durationHours: durationHours.value,
    venueBufferMinutes: venueBufferMinutes.value
  })
  emit('update:modelValue', false)
}

function handleCancel() {
  emit('update:modelValue', false)
}

watch(isOpen, (open) => {
  if (open) {
    const now = new Date()
    calendarMonth.value = new Date(now.getFullYear(), now.getMonth())
    selectedDate.value = new Date(now)
  }
})
</script>

<template>
  <AppModal
    v-model="isOpen"
    max-width="3xl"
    align="top"
  >
    <div class="flex max-h-[85vh] flex-col gap-6 overflow-y-auto">
      <header class="space-y-1">
        <button
          type="button"
          class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary-600 hover:text-primary-700 dark:text-primary-400"
          @click="isOpen = false"
        >
          <span class="material-symbols-outlined text-sm">arrow_back</span>
          Back to Event Hub
        </button>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Schedule Session
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Define the core timeline for your upcoming session. Choose a date and time slot that fits the rhythm of your audience.
        </p>
      </header>

      <div class="grid gap-6 lg:grid-cols-5">
        <!-- Left column: Calendar + Quick Tip -->
        <div class="space-y-4 lg:col-span-2">
          <!-- Select Date -->
          <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-slate-800/50">
            <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
              Select Date
            </h3>
            <div class="flex items-center justify-between pb-2">
              <button
                type="button"
                class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
                aria-label="Previous month"
                @click="prevMonth"
              >
                <span class="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ monthLabel }}
              </span>
              <button
                type="button"
                class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
                aria-label="Next month"
                @click="nextMonth"
              >
                <span class="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
            <div class="grid grid-cols-7 gap-0.5 text-center">
              <span
                v-for="d in ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']"
                :key="d"
                class="py-1 text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400"
              >
                {{ d }}
              </span>
              <template v-for="(week, wi) in calendarWeeks" :key="wi">
                <button
                  v-for="(day, di) in week"
                  :key="`${wi}-${di}`"
                  type="button"
                  :class="[
                    'rounded-lg py-2 text-sm transition',
                    !day.isCurrentMonth && 'text-gray-300 dark:text-gray-600',
                    day.isCurrentMonth && !isSameDay(day.date, selectedDate) && 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                    isSameDay(day.date, selectedDate) && 'bg-primary-500 font-semibold text-white ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-900'
                  ]"
                  @click="selectDay(day)"
                >
                  {{ day.day }}
                </button>
              </template>
            </div>
          </div>

          <!-- Quick Tip -->
          <div class="rounded-2xl bg-primary-500 p-4 text-white shadow-sm">
            <h3 class="mb-2 text-sm font-semibold">
              Quick Tip
            </h3>
            <p class="text-sm leading-relaxed opacity-95">
              Most urban tech meetups perform best between 18:00 and 20:00. This avoids the morning rush and lunch breaks.
            </p>
            <div class="mt-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-90">
              <span class="material-symbols-outlined text-sm">push_pin</span>
              Smart scheduling active
            </div>
          </div>
        </div>

        <!-- Right column: Timeline + Estimated Traffic + Slot Summary -->
        <div class="space-y-4 lg:col-span-3">
          <!-- Timeline Selector -->
          <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-slate-800/50">
            <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
              Timeline Selector
            </h3>
            <div class="mb-3 flex items-center gap-4 text-xs">
              <span class="flex items-center gap-1.5">
                <span class="h-2.5 w-2.5 rounded-full bg-primary-500" />
                Selected
              </span>
              <span class="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <span class="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                Available
              </span>
            </div>
            <div class="mb-4">
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Session duration
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="dur in durationOptions"
                  :key="dur"
                  type="button"
                  :class="[
                    'rounded-lg px-3 py-2 text-sm font-medium transition',
                    durationHours === dur
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  ]"
                  @click="setDuration(dur)"
                >
                  {{ dur }} {{ dur === 1 ? 'Hour' : 'Hours' }}
                </button>
              </div>
            </div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Start time
            </p>
            <div class="grid grid-cols-4 gap-2 sm:grid-cols-6">
              <button
                v-for="slot in timeSlots"
                :key="slot"
                type="button"
                :class="[
                  'rounded-lg px-3 py-2 text-sm font-medium transition',
                  isSlotInRange(slot)
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                ]"
                @click="setStartTime(slot)"
              >
                {{ slot }}
              </button>
            </div>
          </div>

          <!-- Estimated Traffic -->
          <div class="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-slate-800/30">
            <div class="flex items-center gap-2">
              <span class="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                <span class="material-symbols-outlined text-xs">info</span>
              </span>
              <span class="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Estimated traffic
              </span>
            </div>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Peak attendance predicted for this slot.
            </p>
            <div class="mt-2 flex items-center gap-1">
              <div class="flex -space-x-2">
                <span
                  v-for="i in 4"
                  :key="i"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-200 text-xs font-medium text-primary-800 dark:border-slate-800 dark:bg-primary-700 dark:text-primary-200"
                >
                  {{ String.fromCharCode(64 + i) }}
                </span>
              </div>
              <span class="ml-1 text-sm font-semibold text-gray-700 dark:text-gray-300">+42</span>
            </div>
          </div>

          <!-- Slot Summary -->
          <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-slate-800/50">
            <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
              Slot Summary
            </h3>
            <div class="space-y-2 text-sm">
              <div>
                <span class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Date selected</span>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ slotSummaryDate }}
                </p>
              </div>
              <div>
                <span class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Time window</span>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ startTimeSlot }} – {{ endTimeComputed }}
                </p>
              </div>
              <div>
                <span class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Venue buffer</span>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ venueBufferMinutes }} Minutes
                </p>
              </div>
            </div>
            <div class="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                class="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                @click="handleCancel"
              >
                Cancel
              </button>
              <AppButton
                type="button"
                @click="handleConfirm"
              >
                Confirm Session
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppModal>
</template>
