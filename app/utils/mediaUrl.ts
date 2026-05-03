/**
 * Turn API asset paths such as `/api/v1/uploads/...` into a browser-absolute URL using
 * `public.apiBase` (e.g. `http://localhost:8000/api/v1`).
 */
export function resolveApiUploadUrl(path: string | undefined | null, apiBase: string): string | undefined {
  if (!path?.trim()) return undefined
  const p = path.trim()
  if (p.startsWith('http://') || p.startsWith('https://')) return p

  try {
    const normalizedBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase
    const baseUrl = new URL(`${normalizedBase}/`)
    const origin = baseUrl.origin
    const suffix = p.startsWith('/') ? p : `/${p}`
    return `${origin}${suffix}`
  }
  catch {
    const base = String(apiBase || '').replace(/\/$/, '')
    return `${base}/${p.replace(/^\//, '')}`
  }
}
