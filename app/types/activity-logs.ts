export interface ActivityLog {
  id?: string | number
  action?: string
  type?: string
  title?: string
  description?: string
  details?: string
  meta?: unknown
  entity?: unknown
  entity_type?: string
  entity_name?: string
  created_at?: string
  timestamp?: string
  /**
   * Backend fields are not fully known yet, so we keep the object open.
   * This prevents type errors when the API returns additional keys.
   */
  [key: string]: unknown
}

