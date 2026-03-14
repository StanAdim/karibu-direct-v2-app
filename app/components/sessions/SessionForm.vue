<script setup lang="ts">
import type { Session, SessionCreateInput, SessionLevel, SessionType, SessionUpdateInput } from '~/types'
import type { SessionSpeaker } from '~/types'

export interface InitialSchedule {
  date: string
  startTime: string
  endTime: string
}

interface Props {
  session?: Session
  event_id: string
  loading?: boolean
  /** Prefill start/end from Schedule Session modal. */
  initialSchedule?: InitialSchedule
  /** Show "NEW ENTRY" / "Add Session" header and description (e.g. on event detail Sessions tab). */
  showHeader?: boolean
  /** Venue/room options for dropdown. */
  venueOptions?: { value: string; label: string }[]
  /** Slots used (e.g. 12). Shown with slotsTotal in "Slots Used" card. */
  slotsUsed?: number
  /** Total slots (e.g. 15). */
  slotsTotal?: number
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: false,
  venueOptions: () => [
    { value: 'Main Ballroom', label: 'Main Ballroom' },
    { value: 'Room A', label: 'Room A' },
    { value: 'Room B', label: 'Room B' },
    { value: 'Auditorium', label: 'Auditorium' },
    { value: 'Workshop Room 1', label: 'Workshop Room 1' }
  ],
  slotsUsed: undefined,
  slotsTotal: undefined
})

const emit = defineEmits<{
  submit: [data: SessionCreateInput | SessionUpdateInput]
  cancel: []
}>()

const isEditing = computed(() => !!props.session)

function getInitialStartTime(): string {
  if (props.session?.start_time) return props.session.start_time
  if (props.initialSchedule) return `${props.initialSchedule.date}T${props.initialSchedule.startTime}`
  return ''
}
function getInitialEndTime(): string {
  if (props.session?.end_time) return props.session.end_time
  if (props.initialSchedule) return `${props.initialSchedule.date}T${props.initialSchedule.endTime}`
  return ''
}

const form = reactive<SessionCreateInput>({
  event_id: props.event_id,
  title: props.session?.title || '',
  description: props.session?.description || '',
  type: props.session?.type || 'talk',
  start_time: getInitialStartTime(),
  end_time: getInitialEndTime(),
  location: props.session?.location || '',
  room: props.session?.room || '',
  capacity: props.session?.capacity,
  speakers: props.session?.speakers?.length
    ? [...props.session.speakers]
    : [],
  track: props.session?.track || '',
  level: props.session?.level,
  is_break: props.session?.is_break || false
})

watch(
  () => [props.initialSchedule, props.session] as const,
  () => {
    form.start_time = getInitialStartTime()
    form.end_time = getInitialEndTime()
  },
  { deep: true }
)

const errors = reactive<Record<string, string>>({})

const sessionTypes: { value: SessionType; label: string; icon: string }[] = [
  { value: 'keynote', label: 'Keynote', icon: 'i-lucide-mic-2' },
  { value: 'workshop', label: 'Workshop', icon: 'i-lucide-hammer' },
  { value: 'panel', label: 'Panel', icon: 'i-lucide-users' },
  { value: 'talk', label: 'Talk', icon: 'i-lucide-presentation' },
  { value: 'networking', label: 'Networking', icon: 'i-lucide-handshake' },
  { value: 'break', label: 'Break', icon: 'i-lucide-coffee' },
  { value: 'other', label: 'Other', icon: 'i-lucide-calendar' }
]

const sessionLevels: { value: SessionLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'all', label: 'All Levels' }
]

const speakerName = computed({
  get: () => form.speakers?.[0]?.name ?? '',
  set: (value: string) => {
    if (!form.speakers?.length) {
      form.speakers = [{ name: value } as Omit<SessionSpeaker, 'id'>]
    } else {
      form.speakers[0] = { ...form.speakers[0], name: value }
    }
  }
})

const roomSelectValue = computed({
  get: () => form.room || '',
  set: (value: string) => {
    form.room = value
  }
})

const descriptionEditorRef = ref<HTMLDivElement | null>(null)

watch(() => form.type, (newType) => {
  form.is_break = newType === 'break'
})

watch(() => props.event_id, (id) => {
  form.event_id = id
})

function initDescriptionEditor() {
  nextTick(() => {
    const el = descriptionEditorRef.value
    if (el && form.description) {
      el.innerHTML = form.description
    }
  })
}

onMounted(initDescriptionEditor)
watch(() => props.session?.description, initDescriptionEditor)

function execCommand(cmd: string, value?: string) {
  document.execCommand(cmd, false, value)
  descriptionEditorRef.value?.focus()
}

function validateForm(): boolean {
  const newErrors: Record<string, string> = {}

  if (!form.title.trim()) {
    newErrors.title = 'Title is required'
  }

  if (!form.start_time) {
    newErrors.start_time = 'Start time is required'
  }

  if (!form.end_time) {
    newErrors.end_time = 'End time is required'
  }
  else if (form.start_time && new Date(form.end_time) <= new Date(form.start_time)) {
    newErrors.end_time = 'End time must be after start time'
  }

  Object.assign(errors, newErrors)
  Object.keys(errors).forEach((key) => {
    if (!newErrors[key]) {
      delete errors[key]
    }
  })

  return Object.keys(newErrors).length === 0
}

function syncDescriptionFromEditor() {
  if (descriptionEditorRef.value) {
    form.description = descriptionEditorRef.value.innerHTML || ''
  }
}

function handleSubmit() {
  syncDescriptionFromEditor()
  if (!validateForm()) return
  emit('submit', form)
}
</script>

<template>
  <form
    class="space-y-6"
    @submit.prevent="handleSubmit"
  >
    <header
      v-if="showHeader"
      class="space-y-2"
    >
      <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        NEW ENTRY
      </p>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
        {{ isEditing ? 'Edit Session' : 'Add Session' }}
      </h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Configure the details for your upcoming event session. All fields are required to ensure a smooth attendee experience.
      </p>
    </header>

    <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
      <div class="space-y-6">
        <AppInput
          v-model="form.title"
          label="SESSION TITLE"
          placeholder="e.g. Future of Urban Design"
          required
          :error="errors.title"
          class="[&_.ml-1]:text-xs [&_.ml-1]:uppercase [&_.ml-1]:tracking-wide [&_.ml-1]:text-slate-500"
        />

        <div class="flex flex-col gap-1.5">
          <label class="ml-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            SPEAKER NAME
          </label>
          <div class="relative">
            <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <UIcon
                name="i-lucide-user"
                class="size-4"
              />
            </span>
            <input
              v-model="speakerName"
              type="text"
              placeholder="Search or enter name"
              class="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="ml-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            VENUE / ROOM
          </label>
          <div class="relative">
            <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <UIcon
                name="i-lucide-map-pin"
                class="size-4"
              />
            </span>
            <USelect
              v-model="roomSelectValue"
              :items="venueOptions"
              value-key="value"
              label-key="label"
              placeholder="Select venue or room"
              class="h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              <UIcon
                name="i-lucide-chevron-down"
                class="size-4"
              />
            </span>
          </div>
        </div>

        <div class="grid gap-6 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label class="ml-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              START TIME
            </label>
            <div class="relative">
              <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <UIcon
                  name="i-lucide-clock"
                  class="size-4"
                />
              </span>
              <input
                v-model="form.start_time"
                type="datetime-local"
                class="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 [&::-webkit-datetime-edit]:text-slate-500"
                :class="{ 'border-red-500': errors.start_time }"
              >
            </div>
            <p
              v-if="errors.start_time"
              class="ml-1 text-xs text-red-500"
            >
              {{ errors.start_time }}
            </p>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="ml-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              END TIME
            </label>
            <div class="relative">
              <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <UIcon
                  name="i-lucide-clock"
                  class="size-4"
                />
              </span>
              <input
                v-model="form.end_time"
                type="datetime-local"
                class="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-slate-900 outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 [&::-webkit-datetime-edit]:text-slate-500"
                :class="{ 'border-red-500': errors.end_time }"
              >
            </div>
            <p
              v-if="errors.end_time"
              class="ml-1 text-xs text-red-500"
            >
              {{ errors.end_time }}
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="ml-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            SESSION DESCRIPTION
          </label>
          <div class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <div
              class="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800/80"
            >
              <button
                type="button"
                class="rounded p-1.5 text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                title="Bold"
                @click.prevent="execCommand('bold')"
              >
                <span class="text-sm font-bold">B</span>
              </button>
              <button
                type="button"
                class="rounded p-1.5 italic text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                title="Italic"
                @click.prevent="execCommand('italic')"
              >
                <span class="text-sm">I</span>
              </button>
              <button
                type="button"
                class="rounded p-1.5 text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                title="Unordered list"
                @click.prevent="execCommand('insertUnorderedList')"
              >
                <UIcon
                  name="i-lucide-list"
                  class="size-4"
                />
              </button>
              <button
                type="button"
                class="rounded p-1.5 text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                title="Blockquote"
                @click.prevent="execCommand('formatBlock', 'blockquote')"
              >
                <UIcon
                  name="i-lucide-quote"
                  class="size-4"
                />
              </button>
              <button
                type="button"
                class="rounded p-1.5 text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                title="Link"
                @click.prevent="execCommand('createLink', prompt('URL:') || undefined)"
              >
                <UIcon
                  name="i-lucide-link"
                  class="size-4"
                />
              </button>
              <button
                type="button"
                class="rounded p-1.5 text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                title="Image"
                @click.prevent="execCommand('insertImage', prompt('Image URL:') || undefined)"
              >
                <UIcon
                  name="i-lucide-image"
                  class="size-4"
                />
              </button>
            </div>
            <div
              ref="descriptionEditorRef"
              contenteditable="true"
              class="session-description-editor min-h-[120px] px-4 py-3 text-slate-900 outline-none dark:text-slate-100 [&_ul]:list-inside [&_ul]:list-disc [&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:italic"
              :class="[
                'bg-white dark:bg-slate-800',
                'focus:ring-2 focus:ring-primary-500 focus:ring-inset'
              ]"
              data-placeholder="What will attendees learn in this session?"
              @input="syncDescriptionFromEditor"
              @blur="syncDescriptionFromEditor"
            />
          </div>
          <p
            v-if="errors.description"
            class="ml-1 text-xs text-red-500"
          >
            {{ errors.description }}
          </p>
        </div>

        <!-- Session Type (collapsed by default or visible - reference doesn't show it on main card, keep for data) -->
        <details class="group">
          <summary class="cursor-pointer text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Session type &amp; level
          </summary>
          <div class="mt-4 space-y-4">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="type in sessionTypes"
                :key="type.value"
                type="button"
                :class="[
                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  form.type === type.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                ]"
                @click="form.type = type.value"
              >
                <UIcon
                  :name="type.icon"
                  class="h-4 w-4"
                />
                {{ type.label }}
              </button>
            </div>
            <div
              v-if="!form.is_break"
              class="flex flex-col gap-1.5"
            >
              <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Level</label>
              <USelect
                v-model="form.level"
                :items="sessionLevels"
                value-key="value"
                label-key="label"
                placeholder="Select level"
                class="h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </details>
      </div>

      <div class="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
        <button
          type="button"
          class="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <AppButton
          type="submit"
          :loading="loading"
          icon="i-lucide-check"
          icon-position="left"
        >
          {{ isEditing ? 'Update Session' : 'Save Session' }}
        </AppButton>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-xl border border-primary-100 bg-primary-50/50 p-4 dark:border-primary-900/50 dark:bg-primary-950/30">
        <div class="flex items-start gap-3">
          <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
            <UIcon
              name="i-lucide-info"
              class="size-3.5"
            />
          </span>
          <div>
            <p class="text-sm font-semibold text-primary-800 dark:text-primary-200">
              Auto-Scheduling
            </p>
            <p class="mt-0.5 text-xs text-primary-700/90 dark:text-primary-300/90">
              Our AI helps resolve room conflicts based on speaker availability and venue capacity.
            </p>
          </div>
        </div>
      </div>
      <div
        v-if="slotsTotal != null && slotsUsed != null"
        class="rounded-xl border border-primary-100 bg-primary-50/50 p-4 dark:border-primary-900/50 dark:bg-primary-950/30"
      >
        <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">
          {{ slotsUsed }}/{{ slotsTotal }}
        </p>
        <p class="mt-1 text-xs font-semibold uppercase tracking-wide text-primary-700/80 dark:text-primary-300/80">
          Slots used
        </p>
      </div>
    </div>
  </form>
</template>

<style scoped>
.session-description-editor:empty::before {
  content: attr(data-placeholder);
  color: var(--tw-slate-400);
}
.dark .session-description-editor:empty::before {
  color: var(--tw-slate-500);
}
</style>
