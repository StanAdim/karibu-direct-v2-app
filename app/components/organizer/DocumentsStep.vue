<script setup lang="ts">
const wizard = useOrganizerWizardStore()
const orgStore = useOrganizerApplicationStore()

const previews = reactive<{
  logo?: string
  business_license?: string
  verification_document?: string
}>({})

const LOGO_MAX = 5 * 1024 * 1024
const DOC_MAX = 10 * 1024 * 1024

type DocKind = 'logo' | 'business_license' | 'verification_document'

function revokePreview(kind: DocKind): void {
  const u = previews[kind]
  if (u) URL.revokeObjectURL(u)
  if (kind === 'logo') previews.logo = undefined
  else if (kind === 'business_license') previews.business_license = undefined
  else previews.verification_document = undefined
}

function onPick(kind: DocKind, file: File): void {
  revokePreview(kind)
  previews[kind] = URL.createObjectURL(file)
  wizard.setPendingFile(kind, file)
  wizard.clearFieldError(kind)
}

onBeforeUnmount(() => {
  revokePreview('logo')
  revokePreview('business_license')
  revokePreview('verification_document')
})

const uploadProgress = computed(() => orgStore.uploadProgress)

defineProps<{
  mode: 'create' | 'edit'
}>()
</script>

<template>
  <div class="space-y-6">
    <p
      v-if="mode === 'create'"
      class="text-sm text-slate-600 dark:text-slate-400"
    >
      Choose files now; they upload automatically right after your application is created.
    </p>

    <div id="wizard-field-logo">
      <UploadDropzone
        label="Logo *"
        description="PNG, JPG, WebP or GIF — max 5 MB"
        accept="image/png,image/jpeg,image/webp,image/gif"
        :max-bytes="LOGO_MAX"
        :existing-url="orgStore.application?.logo_url"
        :preview-url="previews.logo"
        :progress="uploadProgress.logo ?? null"
        :error="wizard.fieldErrors.logo"
        @select="onPick('logo', $event)"
      />
    </div>

    <div id="wizard-field-business_license">
      <UploadDropzone
        label="Business license *"
        description="PDF or image — max 10 MB"
        accept="application/pdf,image/png,image/jpeg"
        :max-bytes="DOC_MAX"
        :existing-url="orgStore.application?.business_license_url"
        :preview-url="previews.business_license"
        :progress="uploadProgress.business_license ?? null"
        :error="wizard.fieldErrors.business_license"
        @select="onPick('business_license', $event)"
      />
    </div>

    <div id="wizard-field-verification_document">
      <UploadDropzone
        label="Verification document *"
        description="PDF or image — max 10 MB"
        accept="application/pdf,image/png,image/jpeg"
        :max-bytes="DOC_MAX"
        :existing-url="orgStore.application?.verification_document_url || orgStore.application?.certificate_url"
        :preview-url="previews.verification_document"
        :progress="uploadProgress.verification_document ?? null"
        :error="wizard.fieldErrors.verification_document"
        @select="onPick('verification_document', $event)"
      />
    </div>
  </div>
</template>
