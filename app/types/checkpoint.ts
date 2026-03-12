export interface Checkpoint {
  id: string
  eventId: string
  name: string
  description?: string
  type: CheckpointType
  location?: string
  isActive: boolean
  scanCount: number
  settings: CheckpointSettings
  createdAt: string
  updatedAt: string
}

export type CheckpointType = 'entry' | 'exit' | 'session' | 'booth' | 'custom'

export interface CheckpointSettings {
  allowMultipleScans: boolean
  requireTicket: boolean
  restrictToTicketTypes?: string[]
  maxCapacity?: number
  autoClose?: string
}

export interface CheckpointScan {
  id: string
  checkpointId: string
  participantId: string
  ticketId?: string
  scannedAt: string
  scannedBy?: string
  status: ScanStatus
  notes?: string
}

export type ScanStatus = 'success' | 'failed' | 'duplicate' | 'invalid_ticket' | 'capacity_reached'

export interface CheckpointCreateInput {
  eventId: string
  name: string
  description?: string
  type: CheckpointType
  location?: string
  settings?: Partial<CheckpointSettings>
}

export interface CheckpointUpdateInput extends Partial<Omit<CheckpointCreateInput, 'eventId'>> {
  isActive?: boolean
}

export interface CheckpointStats {
  totalScans: number
  uniqueScans: number
  failedScans: number
  lastScanTime?: string
  scansByHour: { hour: string; count: number }[]
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
