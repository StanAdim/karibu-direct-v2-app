import { computed, reactive, watch, type Ref } from 'vue'
import type { Session, SessionCreateInput, SessionUpdateInput } from '~/types'
import { coerceSessionType } from '~/types'

export interface SessionInitialSchedule {
  date: string
  startTime: string
  endTime: string
}

function scheduleToStartIso(sch: SessionInitialSchedule): string {
  return `${sch.date}T${sch.startTime}`
}

function scheduleToEndIso(sch: SessionInitialSchedule): string {
  return `${sch.date}T${sch.endTime}`
}

export function parseTagsInput(raw: string): string[] {
  return raw
    .split(/[,#]/)
    .map(t => t.trim())
    .filter(Boolean)
}

export function formatTagsForInput(tags: string[] | undefined): string {
  return (tags ?? []).join(', ')
}

export function validateSessionForm(
  form: SessionCreateInput,
  errors: Record<string, string>
): boolean {
  const next: Record<string, string> = {}

  if (!form.title.trim()) {
    next.title = 'Title is required'
  }

  if (!form.session_type) {
    next.session_type = 'Session type is required'
  }

  if (!form.start_time) {
    next.start_time = 'Start time is required'
  }

  if (!form.end_time) {
    next.end_time = 'End time is required'
  }
  else if (form.start_time && new Date(form.end_time) <= new Date(form.start_time)) {
    next.end_time = 'End time must be after start time'
  }

  if (form.capacity != null && form.capacity !== undefined) {
    const c = Number(form.capacity)
    if (!Number.isFinite(c) || c < 0) {
      next.capacity = 'Capacity must be zero or a positive number'
    }
  }

  Object.keys(errors).forEach(k => {
    delete errors[k]
  })
  Object.assign(errors, next)
  return Object.keys(next).length === 0
}

export function createEmptySessionForm(eventId: string): SessionCreateInput {
  return {
    event_id: eventId,
    title: '',
    description: '',
    session_type: 'other',
    start_time: '',
    end_time: '',
    room: '',
    capacity: undefined,
    tags: []
  }
}

export function sessionToFormDraft(session: Session, eventId: string): SessionCreateInput {
  return {
    event_id: eventId,
    title: session.title,
    description: session.description || '',
    session_type: coerceSessionType(session.session_type),
    start_time: session.start_time,
    end_time: session.end_time,
    room: session.room || '',
    capacity: session.capacity,
    tags: session.tags ? [...session.tags] : []
  }
}

export function useSessionForm(options: {
  eventId: Ref<string>
  session?: Ref<Session | undefined>
  initialSchedule?: Ref<SessionInitialSchedule | null | undefined>
}) {
  const form = reactive<SessionCreateInput>(createEmptySessionForm(options.eventId.value))
  const errors = reactive<Record<string, string>>({})

  const isEditing = computed(() => !!options.session?.value)

  function applyFromSources(): void {
    const eid = options.eventId.value
    form.event_id = eid
    const s = options.session?.value
    const sch = options.initialSchedule?.value

    if (s) {
      Object.assign(form, sessionToFormDraft(s, eid))
      return
    }

    const base = createEmptyFormForCreate(eid, sch)
    Object.assign(form, base)
  }

  function createEmptyFormForCreate(
    eid: string,
    sch: SessionInitialSchedule | null | undefined
  ): SessionCreateInput {
    const empty = createEmptySessionForm(eid)
    if (sch) {
      empty.start_time = scheduleToStartIso(sch)
      empty.end_time = scheduleToEndIso(sch)
    }
    return empty
  }

  watch(
    () => [options.eventId.value, options.session?.value, options.initialSchedule?.value] as const,
    () => {
      applyFromSources()
    },
    { deep: true, immediate: true }
  )

  function validate(): boolean {
    return validateSessionForm(form, errors)
  }

  function toCreatePayload(): SessionCreateInput {
    return { ...form, event_id: options.eventId.value }
  }

  function toUpdatePayload(): SessionUpdateInput {
    const { event_id: _e, ...rest } = form
    return rest as SessionUpdateInput
  }

  return {
    form,
    errors,
    isEditing,
    validate,
    toCreatePayload,
    toUpdatePayload,
    applyFromSources
  }
}
