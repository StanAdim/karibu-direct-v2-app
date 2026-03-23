import type { User } from './user'

/**
 * Session format / agenda category — aligned with backend `SessionType` (StrEnum).
 */
export type SessionType =
  | 'keynote'
  | 'workshop'
  | 'panel'
  | 'breakout'
  | 'networking'
  | 'demo'
  | 'other'

export const SESSION_TYPES: readonly SessionType[] = [
  'keynote',
  'workshop',
  'panel',
  'breakout',
  'networking',
  'demo',
  'other'
] as const

/** Map legacy API values to current `SessionType`. */
export function coerceSessionType(raw: string | undefined | null): SessionType {
  const v = (raw ?? '').toLowerCase()
  if ((SESSION_TYPES as readonly string[]).includes(v)) {
    return v as SessionType
  }
  if (v === 'talk') return 'breakout'
  if (v === 'break') return 'other'
  return 'other'
}

export type SessionLevel = 'beginner' | 'intermediate' | 'advanced' | 'all'

export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

/**
 * Session as returned from the API. Prefer `session_type`; legacy responses may use `type` only.
 */
export interface Session {
  id: string
  event_id: string
  title: string
  description?: string
  session_type: SessionType
  start_time: string
  end_time: string
  room?: string
  capacity?: number
  tags?: string[]
  attendee_count: number
  speakers: SessionSpeaker[]
  track?: string
  level?: SessionLevel
  location?: string
  materials?: SessionMaterial[]
  status: SessionStatus
  is_break: boolean
  created_at: string
  updated_at: string
}

export interface SessionSpeaker {
  id: string
  user?: User
  name: string
  email?: string
  title?: string
  role?: string
  company?: string
  bio?: string
  avatar?: string
  social_links?: {
    twitter?: string
    linkedin?: string
    website?: string
  }
}

export interface SessionMaterial {
  id: string
  name: string
  type: 'slides' | 'document' | 'video' | 'link' | 'other'
  url: string
  is_public: boolean
}

/** POST create / PATCH update body shape expected by the API. */
export interface SessionCreateInput {
  event_id: string
  title: string
  description?: string
  session_type: SessionType
  start_time: string
  end_time: string
  room?: string
  capacity?: number
  tags?: string[]
}

export interface SessionUpdateInput extends Partial<Omit<SessionCreateInput, 'event_id'>> {
  status?: SessionStatus
  /** When the API supports speaker assignment outside the core session fields. */
  speakers?: Omit<SessionSpeaker, 'id'>[]
}

export interface SessionFilters {
  event_id?: string
  session_type?: SessionType
  track?: string
  level?: SessionLevel
  speaker_id?: string
  date?: string
  search?: string
}

/** Raw API row that may use `type` instead of `session_type`. */
export type SessionApiPayload = Partial<Session> &
  Pick<Session, 'id' | 'event_id' | 'title' | 'start_time' | 'end_time'> & {
    type?: SessionType
    session_type?: SessionType
  }

export function normalizeSessionFromApi(raw: SessionApiPayload): Session {
  const { type: legacyType, session_type: st0, ...rest } = raw
  const session_type = coerceSessionType(st0 ?? legacyType)
  return {
    ...rest,
    session_type,
    attendee_count: rest.attendee_count ?? 0,
    speakers: rest.speakers ?? [],
    status: rest.status ?? 'scheduled',
    is_break: rest.is_break ?? false,
    created_at: rest.created_at ?? '',
    updated_at: rest.updated_at ?? ''
  }
}

export function getSessionDuration(session: Session): number {
  const start = new Date(session.start_time)
  const end = new Date(session.end_time)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
}

export function isSessionLive(session: Session): boolean {
  const now = new Date()
  const start = new Date(session.start_time)
  const end = new Date(session.end_time)
  return now >= start && now <= end && session.status === 'scheduled'
}

export function formatSessionTime(session: Session): string {
  const start = new Date(session.start_time)
  const end = new Date(session.end_time)
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
  return `${start.toLocaleTimeString('en-US', options)} - ${end.toLocaleTimeString('en-US', options)}`
}
