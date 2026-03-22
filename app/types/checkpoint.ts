export interface Checkpoint {
  id: string
  event_id: string
  name: string
  description?: string
  type: CheckpointType
  location?: string
  is_active: boolean
  scan_count: number
  settings: CheckpointSettings
  created_at: string
  updated_at: string
}

export type CheckpointType = 'entry' | 'exit' | 'session' | 'booth' | 'custom'

export interface CheckpointSettings {
  allow_multiple_scans: boolean
  require_ticket: boolean
  restrict_to_ticket_types?: string[]
  max_capacity?: number
  auto_close?: string
}

/** POST /checkpoints/scan */
export interface CheckpointScanPayload {
  checkpoint_id: string
  qr_code?: string
  ticket_code?: string
  registration_id?: string
}

export interface CheckpointScan {
  id: string
  checkpoint_id: string
  participant_id: string
  ticket_id?: string
  scanned_at: string
  scanned_by?: string
  status: ScanStatus
  notes?: string
}

export type ScanStatus = 'success' | 'failed' | 'duplicate' | 'invalid_ticket' | 'capacity_reached'

export interface CheckpointCreateInput {
  event_id: string
  name: string
  description?: string
  type: CheckpointType
  location?: string
  settings?: Partial<CheckpointSettings>
}

export interface CheckpointUpdateInput extends Partial<Omit<CheckpointCreateInput, 'event_id'>> {
  is_active?: boolean
}

export interface CheckpointStats {
  total_scans: number
  unique_scans: number
  failed_scans: number
  last_scan_time?: string
  scans_by_hour: { hour: string; count: number }[]
}

export function getCheckpointTypeLabel(type: CheckpointType): string {
  const labels: Record<CheckpointType, string> = {
    entry: 'Entry Point',
    exit: 'Exit Point',
    session: 'Session Check-in',
    booth: 'Booth Visit',
    custom: 'Custom'
  }
  return labels[type]
}

export function getCheckpointTypeIcon(type: CheckpointType): string {
  const icons: Record<CheckpointType, string> = {
    entry: 'i-lucide-log-in',
    exit: 'i-lucide-log-out',
    session: 'i-lucide-calendar-check',
    booth: 'i-lucide-store',
    custom: 'i-lucide-qr-code'
  }
  return icons[type]
}
