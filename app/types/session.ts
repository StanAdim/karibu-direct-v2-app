import type { User } from './user'

export interface Session {
  id: string
  eventId: string
  title: string
  description?: string
  type: SessionType
  startTime: string
  endTime: string
  location?: string
  room?: string
  capacity?: number
  attendeeCount: number
  speakers: SessionSpeaker[]
  track?: string
  level?: SessionLevel
  materials?: SessionMaterial[]
  status: SessionStatus
  isBreak: boolean
  createdAt: string
  updatedAt: string
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
  socialLinks?: {
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
  isPublic: boolean
}

export interface SessionCreateInput {
  eventId: string
  title: string
  description?: string
  type: SessionType
  startTime: string
  endTime: string
  location?: string
  room?: string
  capacity?: number
  speakers?: Omit<SessionSpeaker, 'id'>[]
  track?: string
  level?: SessionLevel
  isBreak?: boolean
}

export interface SessionUpdateInput extends Partial<Omit<SessionCreateInput, 'eventId'>> {
  status?: SessionStatus
}

export interface SessionFilters {
  eventId?: string
  type?: SessionType
  track?: string
  level?: SessionLevel
  speakerId?: string
  date?: string
  search?: string
}

export function getSessionDuration(session: Session): number {
  const start = new Date(session.startTime)
  const end = new Date(session.endTime)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
}

export function isSessionLive(session: Session): boolean {
  const now = new Date()
  const start = new Date(session.startTime)
  const end = new Date(session.endTime)
  return now >= start && now <= end && session.status === 'scheduled'
}

export function formatSessionTime(session: Session): string {
  const start = new Date(session.startTime)
  const end = new Date(session.endTime)
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
  return `${start.toLocaleTimeString('en-US', options)} - ${end.toLocaleTimeString('en-US', options)}`
}
