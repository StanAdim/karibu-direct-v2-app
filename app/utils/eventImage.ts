import { resolveBackendMediaUrl } from '~/utils/mediaUrl'

/** Default placeholder when an event has no cover image (admin / organizer UI). */
export const DEFAULT_EVENT_COVER_FALLBACK =
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&q=80&auto=format&fit=crop'

/**
 * Resolves a stored cover path to a full URL: `http(s)://` values pass through;
 * relative paths are joined with `apiBase`; empty cover uses `fallbackUrl`.
 */
export function getEventCoverImageUrl(
  coverImage: string | undefined | null,
  apiBase: string,
  fallbackUrl: string = DEFAULT_EVENT_COVER_FALLBACK
): string {
  return resolveBackendMediaUrl(coverImage, apiBase) ?? fallbackUrl
}
