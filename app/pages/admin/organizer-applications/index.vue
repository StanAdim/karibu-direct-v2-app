<script setup lang="ts">
import type { OrganizationProfile } from '~/types/organizer'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const store = useOrganizerApplicationStore()
const router = useRouter()
const adminHeaderSearch = useState<string>('adminHeaderSearch', () => '')

const statusTab = ref<string>('')
const page = ref(1)
const pageSize = ref(20)
const sortKey = ref<'created_at' | 'organization_name'>('created_at')
const sortDir = ref<'asc' | 'desc'>('desc')

const applicantByUserId = ref<Record<string, string>>({})
const reviewerByUserId = ref<Record<string, string>>({})

async function load(): Promise<void> {
  await store.fetchAdminList({
    page: page.value,
    size: pageSize.value,
    status: statusTab.value || undefined,
    search: adminHeaderSearch.value || undefined
  })

  const rows = store.adminItems
  const applicantIds = [...new Set(rows.map(r => r.user_id))]
  const reviewerIds = [
    ...new Set(
      rows.map(r => r.reviewed_by).filter((x): x is string => Boolean(x))
    )
  ]

  await Promise.all([
    ...applicantIds.map(async (id) => {
      const label = await store.resolveUserDisplayName(id)
      applicantByUserId.value = { ...applicantByUserId.value, [id]: label }
    }),
    ...reviewerIds.map(async (id) => {
      const label = await store.resolveUserDisplayName(id)
      reviewerByUserId.value = { ...reviewerByUserId.value, [id]: label }
    })
  ])
}

const debouncedLoad = useDebounceFn(() => {
  page.value = 1
  void load()
}, 350)

watch(adminHeaderSearch, () => {
  debouncedLoad()
})

watch([statusTab, page, pageSize], () => {
  void load()
})

onMounted(() => {
  void load()
})

const sortedRows = computed(() => {
  const list = [...store.adminItems]
  const k = sortKey.value
  const d = sortDir.value === 'asc' ? 1 : -1
  list.sort((a, b) => {
    const va = k === 'created_at' ? new Date(a.created_at).getTime() : a.organization_name.toLowerCase()
    const vb = k === 'created_at' ? new Date(b.created_at).getTime() : b.organization_name.toLowerCase()
    if (va < vb) return -1 * d
    if (va > vb) return 1 * d
    return 0
  })
  return list
})

function onRow(row: OrganizationProfile): void {
  void router.push(`/admin/organizer-applications/${row.id}`)
}

const tabs = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Under review', value: 'UNDER_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' }
]

const pagination = computed(() => store.adminPagination)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
          Organizer applications
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Search, filter, and review organization onboarding requests.
        </p>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="t in tabs"
        :key="t.value || 'all'"
        type="button"
        class="rounded-full px-4 py-2 text-sm font-semibold transition-colors border"
        :class="
          statusTab === t.value
            ? 'bg-primary-500 text-white border-primary-500 shadow-md'
            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-primary-400/50'
        "
        @click="statusTab = t.value"
      >
        {{ t.label }}
      </button>
    </div>

    <OrganizerApplicationTable
      :rows="sortedRows"
      :loading="store.adminLoading"
      :applicant-by-user-id="applicantByUserId"
      :reviewer-by-user-id="reviewerByUserId"
      :sort-key="sortKey"
      :sort-dir="sortDir"
      @update:sort-key="sortKey = $event"
      @update:sort-dir="sortDir = $event"
      @row-click="onRow"
    />

    <div
      v-if="pagination && pagination.total_pages > 1"
      class="flex flex-wrap items-center justify-between gap-3"
    >
      <p class="text-sm text-slate-600 dark:text-slate-400">
        Page {{ pagination.page }} of {{ pagination.total_pages }}
      </p>
      <div class="flex gap-2">
        <AppButton
          color="neutral"
          size="sm"
          type="button"
          :disabled="!pagination.has_prev"
          @click="page = Math.max(1, page - 1)"
        >
          Previous
        </AppButton>
        <AppButton
          color="neutral"
          size="sm"
          type="button"
          :disabled="!pagination.has_next"
          @click="page = page + 1"
        >
          Next
        </AppButton>
      </div>
    </div>
  </div>
</template>
