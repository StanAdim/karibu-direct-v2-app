import type { User } from './user'

export interface Session {
  id: string
  event_id: string
  title: string
  description?: string
  type: SessionType
  start_time: string
  end_time: string
  location?: string
  room?: string
  capacity?: number
  attendee_count: number
  speakers: SessionSpeaker[]
  track?: string
  level?: SessionLevel
  materials?: SessionMaterial[]
  status: SessionStatus
  is_break: boolean
  created_at: string
  updated_at: string
}

export type SessionType = 'keynote' | 'workshop' | 'panel' | 'talk' | 'networking' | 'break' | 'other'

export type SessionLevel = 'beginner' | 'intermediate' | 'advanced' | 'all'

export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

export interface SessionSpeaker {
  id: string
  user?: User
  name: string
  email?: string
  title?: string
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

export interface SessionCreateInput {
  event_id: string
  title: string
  description?: string
  type: SessionType
  start_time: string
  end_time: string
  location?: string
  room?: string
  capacity?: number
  speakers?: Omit<SessionSpeaker, 'id'>[]
  track?: string
  level?: SessionLevel
  is_break?: boolean
}

export interface SessionUpdateInput extends Partial<Omit<SessionCreateInput, 'event_id'>> {
  status?: SessionStatus
}

export interface SessionFilters {
  event_id?: string
  type?: SessionType
  track?: string
  level?: SessionLevel
  speaker_id?: string
  date?: string
  search?: string
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
