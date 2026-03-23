import { computed, type Ref } from 'vue'
import type { Session } from '~/types'

function trackKey(session: Session): string {
  return (session.track || 'General').trim() || 'General'
}

/** True when [aStart,aEnd) overlaps [bStart,bEnd). */
export function sessionRangesOverlap(a: Session, b: Session): boolean {
  const aStart = new Date(a.start_time).getTime()
  const aEnd = new Date(a.end_time).getTime()
  const bStart = new Date(b.start_time).getTime()
  const bEnd = new Date(b.end_time).getTime()
  if (!Number.isFinite(aStart) || !Number.isFinite(aEnd) || !Number.isFinite(bStart) || !Number.isFinite(bEnd)) {
    return false
  }
  if (aEnd <= aStart || bEnd <= bStart) {
    return false
  }
  return aStart < bEnd && bStart < aEnd
}

/**
 * Sessions on the same track with overlapping time windows.
 * Breaks are excluded from conflict detection.
 */
export function getOverlappingSessionIds(sessions: Session[]): Set<string> {
  const list = sessions.filter(s => !s.is_break)
  const overlaps = new Set<string>()
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i]
      const b = list[j]
      if (!a || !b) continue
      if (trackKey(a) !== trackKey(b)) continue
      if (sessionRangesOverlap(a, b)) {
        overlaps.add(a.id)
        overlaps.add(b.id)
      }
    }
  }
  return overlaps
}

export function useSessionSchedule(sessions: Ref<Session[]>) {
  const overlappingIds = computed(() => getOverlappingSessionIds(sessions.value))

  function hasOverlap(sessionId: string): boolean {
    return overlappingIds.value.has(sessionId)
  }

  return {
    overlappingIds,
    hasOverlap,
    sessionRangesOverlap,
    getOverlappingSessionIds
  }
}
