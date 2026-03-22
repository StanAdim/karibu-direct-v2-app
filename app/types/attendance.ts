import type { Participant } from './participant'

/** POST /attendance/checkin */
export interface QrCheckInPayload {
  qr_code: string
  event_id?: string
  session_id?: string
  checkpoint_id?: string
  notes?: string
}

export interface AttendanceRecord {
  id: string
  event_id: string
  session_id?: string
  registration_id?: string
  participant_id?: string
  user_id?: string
  checked_in_at: string
  checked_out_at?: string
  source?: 'qr' | 'manual' | 'api'
  participant?: Participant
}

export interface SessionAttendanceStats {
  session_id: string
  registered: number
  checked_in: number
  capacity?: number
  no_show?: number
  updated_at?: string
}
