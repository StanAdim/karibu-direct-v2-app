<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const router = useRouter()
const store = useOrganizerApplicationStore()
const notifications = useNotifications()

const profileId = computed(() => String(route.params.id || ''))

const reviewOpen = ref(false)
const applicantName = ref('—')
const reviewerName = ref('—')

async function hydrate(): Promise<void> {
  const id = profileId.value
  if (!id) return
  await store.fetchAdminDetail(id)
  const p = store.adminDetail?.profile
  if (p?.user_id) {
    applicantName.value = await store.resolveUserDisplayName(p.user_id)
  }
  if (p?.reviewed_by) {
    reviewerName.value = await store.resolveUserDisplayName(p.reviewed_by)
  }
}

watch(profileId, () => {
  void hydrate()
}, { immediate: true })

onBeforeUnmount(() => {
  store.clearAdminDetail()
})

async function onReviewSubmit(payload: { action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES'; comment: string }): Promise<void> {
  try {
    await store.submitAdminReview(profileId.value, {
      action: payload.action,
      comment: payload.comment || null
    })
    notifications.success({ title: 'Review saved', description: 'The application has been updated.' })
    reviewOpen.value = false
    await hydrate()
  }
  catch {
    /* toast via api */
  }
}

const detail = computed(() => store.adminDetail)
const loading = computed(() => store.adminDetailLoading)
</script>

<template>
  <div class="space-y-6 max-w-5xl">
    <div class="flex flex-wrap items-center gap-3">
      <AppButton
        color="neutral"
        size="sm"
        type="button"
        @click="router.push('/admin/organizer-applications')"
      >
        Back to list
      </AppButton>
    </div>

    <div
      v-if="loading"
      class="rounded-2xl border border-slate-200 dark:border-slate-800 p-12 flex justify-center bg-white dark:bg-slate-900"
    >
      <span class="size-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
    </div>

    <template v-else-if="detail">
      <div class="flex flex-col lg:flex-row lg:items-start gap-4 justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
            {{ detail.profile.organization_name }}
          </h1>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Applicant: {{ applicantName }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <OrganizationStatusBadge :status="detail.profile.status" />
          <AppButton
            v-if="detail.profile.status !== 'APPROVED'"
            type="button"
            @click="reviewOpen = true"
          >
            Review
          </AppButton>
        </div>
      </div>

      <OrganizationProfileCard
        :profile="detail.profile"
        dense
      />

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-2 text-sm">
          <h3 class="font-bold text-slate-900 dark:text-white">
            Applicant
          </h3>
          <p class="text-slate-600 dark:text-slate-400">
            {{ applicantName }}
          </p>
          <p class="text-slate-500 text-xs">
            User ID: <span class="font-mono">{{ detail.profile.user_id }}</span>
          </p>
        </div>
        <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-2 text-sm">
          <h3 class="font-bold text-slate-900 dark:text-white">
            Review
          </h3>
          <p class="text-slate-600 dark:text-slate-400">
            Reviewed by: {{ detail.profile.reviewed_by ? reviewerName : '—' }}
          </p>
          <p
            v-if="detail.profile.reviewed_at"
            class="text-slate-500"
          >
            {{ new Date(detail.profile.reviewed_at).toLocaleString() }}
          </p>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
        <h3 class="font-bold text-slate-900 dark:text-white mb-3">
          Organization details
        </h3>
        <dl class="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-slate-500">
              Contact email
            </dt>
            <dd class="font-medium text-slate-900 dark:text-white">
              {{ detail.profile.email }}
            </dd>
          </div>
          <div>
            <dt class="text-slate-500">
              Phone
            </dt>
            <dd class="font-medium text-slate-900 dark:text-white">
              {{ detail.profile.phone_number }}
            </dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-slate-500">
              Website
            </dt>
            <dd class="font-medium text-slate-900 dark:text-white break-all">
              <a
                v-if="detail.profile.website"
                :href="detail.profile.website"
                class="text-primary-600 dark:text-primary-400"
                target="_blank"
                rel="noopener noreferrer"
              >{{ detail.profile.website }}</a>
              <span v-else>—</span>
            </dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-slate-500">
              Address
            </dt>
            <dd class="font-medium text-slate-900 dark:text-white">
              {{ [detail.profile.address, detail.profile.ward, detail.profile.district, detail.profile.region, detail.profile.country].filter(Boolean).join(', ') || '—' }}
            </dd>
          </div>
        </dl>
      </div>

      <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5">
        <h3 class="font-bold text-slate-900 dark:text-white mb-3">
          Documents
        </h3>
        <ul class="grid sm:grid-cols-3 gap-3 text-sm">
          <li class="rounded-xl border border-slate-100 dark:border-slate-800 p-3">
            <p class="text-xs font-bold text-slate-500 uppercase">
              Logo
            </p>
            <a
              v-if="detail.profile.logo_url"
              :href="detail.profile.logo_url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary-600 font-semibold mt-1 inline-block"
            >Open</a>
            <p
              v-else
              class="text-slate-400 mt-1"
            >
              —
            </p>
          </li>
          <li class="rounded-xl border border-slate-100 dark:border-slate-800 p-3">
            <p class="text-xs font-bold text-slate-500 uppercase">
              Certificate
            </p>
            <a
              v-if="detail.profile.certificate_url"
              :href="detail.profile.certificate_url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary-600 font-semibold mt-1 inline-block"
            >Open</a>
            <p
              v-else
              class="text-slate-400 mt-1"
            >
              —
            </p>
          </li>
          <li class="rounded-xl border border-slate-100 dark:border-slate-800 p-3">
            <p class="text-xs font-bold text-slate-500 uppercase">
              License
            </p>
            <a
              v-if="detail.profile.business_license_url"
              :href="detail.profile.business_license_url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary-600 font-semibold mt-1 inline-block"
            >Open</a>
            <p
              v-else
              class="text-slate-400 mt-1"
            >
              —
            </p>
          </li>
        </ul>
      </div>

      <ApplicationTimeline :logs="detail.logs" />
    </template>

    <div
      v-else
      class="text-slate-500"
    >
      Application not found.
    </div>

    <ReviewActionModal
      v-model="reviewOpen"
      :loading="store.reviewSubmitting"
      :organization-name="detail?.profile.organization_name"
      @submit="onReviewSubmit"
    />
  </div>
</template>
