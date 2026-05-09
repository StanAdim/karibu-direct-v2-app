import type { OrganizationDocumentKind, UploadResponse } from '~/types/organizer'
import { getEffectiveToken } from '~/utils/jwt'
import { unwrapResource } from '~/utils/unwrapApiResource'

/** Multipart upload for `POST /organizer/profile/documents` (approved organizers). */
export function useOrganizerWorkspaceUpload() {
  const config = useRuntimeConfig()

  function uploadWorkspaceAsset(
    file: File,
    documentType: OrganizationDocumentKind,
    onProgress?: (percent: number | null) => void
  ): Promise<UploadResponse> {
    if (!import.meta.client) {
      return Promise.reject(new Error('Upload is only available in the browser'))
    }

    const token = getEffectiveToken()
    const url = `${config.public.apiBase}/organizer/profile/documents`

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const fd = new FormData()
      fd.append('document_type', documentType)
      fd.append('file', file)

      xhr.upload.onprogress = (ev: ProgressEvent) => {
        if (!onProgress) return
        if (ev.lengthComputable) {
          onProgress(Math.min(100, Math.round((ev.loaded / ev.total) * 100)))
        }
        else {
          onProgress(null)
        }
      }

      xhr.onerror = () => reject(new Error('Network error during upload'))
      xhr.onload = () => {
        try {
          const text = xhr.responseText
          const json = text ? JSON.parse(text) as unknown : null
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = unwrapResource<UploadResponse>(json)
            onProgress?.(100)
            resolve(data)
          }
          else {
            const msg =
              (json as { message?: string })?.message
              || (json as { detail?: string })?.detail
              || `Upload failed (${xhr.status})`
            reject(new Error(msg))
          }
        }
        catch (err) {
          reject(err instanceof Error ? err : new Error('Invalid upload response'))
        }
      }

      xhr.open('POST', url)
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }
      xhr.send(fd)
    })
  }

  return { uploadWorkspaceAsset }
}
