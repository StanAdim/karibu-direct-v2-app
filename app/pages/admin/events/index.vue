<script setup lang="ts">
import type { Event, EventStatus, PaginatedResponse } from '~/types'
import { getEventCoverImageUrl } from '~/utils/eventImage'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const eventsStore = useEventsStore()
const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirmDialog()
const notifications = useNotifications()
const api = useApi()
const adminHeaderSearch = useState<string>('adminHeaderSearch', () => '')

const searchQuery = ref('')
const selectedStatus = ref<EventStatus | ''>('')
const selectedCategory = ref('')

const filterOpen = ref(false)
const previewOpen = ref(false)
const previewEvent = ref<Event | null>(null)

const syncLoading = ref(false)
const rejectLoading = ref(false)
const actionLoadingId = ref<string | null>(null)
const eventToReject = ref<Event | null>(null)

const stats = ref({ pending: 0, approved: 0, rejected: 0 })
const statsLoading = ref(false)

const statusOptions = [
  { value: '' as const, label: 'All statuses' },
  { value: 'draft' as const, label: 'Pending review' },
  { value: 'published' as const, label: 'Published' },
  { value: 'cancelled' as const, label: 'Cancelled' },
  { value: 'completed' as const, label: 'Completed' }
]

const statCards = computed(() => [
  {
    key: 'pending',
    label: 'Pending reviews',
    value: stats.value.pending,
    hint: '+12% from yesterday',
    hintIcon: 'i-lucide-trending-up' as const,
    icon: 'i-lucide-clipboard-list' as const,
    iconWrap: 'bg-primary-100 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400'
  },
  {
    key: 'approved',
    label: 'Approved (live)',
    value: stats.value.approved,
    hint: 'Consistent flow',
    hintIcon: 'i-lucide-check' as const,
    icon: 'i-lucide-shield-check' as const,
    iconWrap: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
  },
  {
    key: 'rejected',
    label: 'Not published',
    value: stats.value.rejected,
    hint: stats.value.rejected > 0 ? 'Includes withdrawn' : 'Low volume',
    hintIcon: stats.value.rejected > 0 ? 'i-lucide-alert-triangle' as const : 'i-lucide-minus' as const,
    icon: 'i-lucide-shield-x' as const,
    iconWrap: 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
  }
])

async function loadSubmissionStats() {
  statsLoading.value = true
  try {
    const [draftRes, pubRes, canRes] = await Promise.all([
      api.get<PaginatedResponse<Event>>('/events/?page=1&per_page=1&status=draft'),
      api.get<PaginatedResponse<Event>>('/events/?page=1&per_page=1&status=published'),
      api.get<PaginatedResponse<Event>>('/events/?page=1&per_page=1&status=cancelled')
    ])
    stats.value = {
      pending: draftRes.meta?.total ?? 0,
      approved: pubRes.meta?.total ?? 0,
      rejected: canRes.meta?.total ?? 0
    }
  }
  catch {
    /* keep previous stats */
  }
  finally {
    statsLoading.value = false
  }
}

async function loadEvents() {
  await eventsStore.fetchEvents({
    status: selectedStatus.value || undefined,
    search: searchQuery.value || undefined,
    category: selectedCategory.value || undefined
  })
}

function openPreview(event: Event) {
  previewEvent.value = event
  previewOpen.value = true
}

async function handleApprove(event: Event) {
  actionLoadingId.value = `${event.id}-approve`
  try {
    await eventsStore.publishEvent(event.id)
    notifications.success({
      title: 'Listing approved',
      description: `${event.title} is now live.`
    })
    await Promise.all([loadEvents(), loadSubmissionStats()])
  }
  catch {
    notifications.error({ title: 'Could not approve this listing.' })
  }
  finally {
    actionLoadingId.value = null
  }
}

async function handleReject(event: Event) {
  eventToReject.value = event
  const ok = await confirm({
    title: 'Reject submission',
    message: `Mark "${event.title}" as cancelled? Organizers can still revise and resubmit.`,
    confirmText: 'Reject',
    variant: 'danger'
  })
  if (!ok || !eventToReject.value) {
    eventToReject.value = null
    return
  }
  rejectLoading.value = true
  actionLoadingId.value = `${event.id}-reject`
  try {
    await eventsStore.cancelEvent(eventToReject.value.id)
    notifications.success({ title: 'Submission rejected' })
    previewOpen.value = false
    await Promise.all([loadEvents(), loadSubmissionStats()])
  }
  catch {
    notifications.error({ title: 'Could not reject this listing.' })
  }
  finally {
    rejectLoading.value = false
    actionLoadingId.value = null
    eventToReject.value = null
  }
}

async function syncAll() {
  syncLoading.value = true
  try {
    await Promise.all([loadEvents(), loadSubmissionStats()])
    notifications.success({ title: 'Queue synced' })
  }
  finally {
    syncLoading.value = false
  }
}

function applyFilters() {
  eventsStore.setPage(1)
  filterOpen.value = false
  loadEvents()
}

function clearFilters() {
  selectedStatus.value = ''
  selectedCategory.value = ''
  searchQuery.value = ''
  adminHeaderSearch.value = ''
  eventsStore.setPage(1)
  filterOpen.value = false
  loadEvents()
}

watch(adminHeaderSearch, useDebounceFn((q) => {
  if (searchQuery.value === q) return
  searchQuery.value = q
  eventsStore.setPage(1)
  loadEvents()
}, 350))

watch(searchQuery, (q) => {
  if (adminHeaderSearch.value !== q) {
    adminHeaderSearch.value = q
  }
})

onMounted(() => {
  loadSubmissionStats()
  if (adminHeaderSearch.value) {
    searchQuery.value = adminHeaderSearch.value
  }
  loadEvents()
})

const paginationFrom = computed(() => {
  const { page, per_page, total } = eventsStore.pagination
  if (total === 0) return 0
  return (page - 1) * per_page + 1
})

const paginationTo = computed(() => {
  const { page, per_page, total } = eventsStore.pagination
  return Math.min(page * per_page, total)
})

function visiblePages(current: number, last: number): (number | 'ellipsis')[] {
  if (last <= 1) return [1]
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1)
  }
  const pages: (number | 'ellipsis')[] = []
  const push = (p: number | 'ellipsis') => {
    if (pages.length && pages[pages.length - 1] === p && p === 'ellipsis') return
    pages.push(p)
  }
  push(1)
  if (current > 3) push('ellipsis')
  for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) {
    push(i)
  }
  if (current < last - 2) push('ellipsis')
  push(last)
  return pages
}

const pagesToShow = computed(() =>
  visiblePages(eventsStore.pagination.page, eventsStore.pagination.last_page)
)
const config = useRuntimeConfig()

function getEventImage(event: Event): string {
  return getEventCoverImageUrl(event.cover_image, String(config.public.apiBase))
}
</script>

<template>
  <div class="relative pb-24">
    <!-- Summary stats -->
    <div class="grid gap-4 sm:grid-cols-3">
      <div
        v-for="card in statCards"
        :key="card.key"
        class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p
              v-if="statsLoading"
              class="text-3xl font-bold text-slate-200 dark:text-slate-700"
            >
              —
            </p>
            <p
              v-else
              class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              {{ card.value.toLocaleString() }}
            </p>
            <p class="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
              {{ card.label }}
            </p>
            <p class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <AppLucideIcon
                :name="card.hintIcon"
                :size="14"
                :class="[
                  'shrink-0',
                  card.key === 'approved' ? 'text-emerald-500' : card.key === 'rejected' && stats.rejected > 0 ? 'text-rose-500' : ''
                ]"
              />
              {{ card.hint }}
            </p>
          </div>
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            :class="card.iconWrap"
          >
            <AppLucideIcon
              :name="card.icon"
              :size="24"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Title + actions -->
    <div class="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Review submissions
        </h1>
        <p class="mt-1 max-w-xl text-sm font-medium text-slate-500 dark:text-slate-400">
          Curate the urban pulse. Review and moderate incoming event listings.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          @click="filterOpen = true"
        >
          <AppLucideIcon
            name="i-lucide-sliders-horizontal"
            :size="18"
          />
          Filter
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-500/20 transition hover:bg-primary-600 disabled:opacity-60"
          :disabled="syncLoading"
          @click="syncAll"
        >
          <AppLucideIcon
            v-if="syncLoading"
            name="i-lucide-loader-2"
            :size="18"
            class="animate-spin"
          />
          <AppLucideIcon
            v-else
            name="i-lucide-refresh-cw"
            :size="18"
          />
          Sync
        </button>
      </div>
    </div>

    <AdminEventReviewTable
      class="mt-8"
      :events="eventsStore.events"
      :loading="eventsStore.loading"
      :action-loading-id="actionLoadingId"
      @view="openPreview"
      @approve="handleApprove"
      @reject="handleReject"
    />

    <div
      class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Showing {{ paginationFrom }}-{{ paginationTo }} of {{ eventsStore.pagination.total }} submissions
      </p>
      <nav
        v-if="eventsStore.pagination.last_page > 1"
        class="flex flex-wrap items-center justify-center gap-1 sm:justify-end"
        aria-label="Pagination"
      >
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-600 enabled:hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:enabled:hover:bg-slate-800"
          :disabled="eventsStore.pagination.page <= 1"
          @click="eventsStore.setPage(eventsStore.pagination.page - 1); loadEvents()"
        >
          ‹
        </button>
        <template
          v-for="(p, i) in pagesToShow"
          :key="i"
        >
          <span
            v-if="p === 'ellipsis'"
            class="px-2 text-slate-400"
          >…</span>
          <button
            v-else
            type="button"
            :class="[
              'min-w-[2.25rem] rounded-lg px-2 py-1.5 text-sm font-bold transition',
              p === eventsStore.pagination.page
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            ]"
            @click="eventsStore.setPage(p); loadEvents()"
          >
            {{ p }}
          </button>
        </template>
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-600 enabled:hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:enabled:hover:bg-slate-800"
          :disabled="eventsStore.pagination.page >= eventsStore.pagination.last_page"
          @click="eventsStore.setPage(eventsStore.pagination.page + 1); loadEvents()"
        >
          ›
        </button>
      </nav>
    </div>

    <!-- FAB -->
    <NuxtLink
      to="/organizer/events/create"
      class="fixed bottom-8 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/35 transition hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 lg:right-10"
      title="New event"
    >
      <AppLucideIcon
        name="i-lucide-plus"
        :size="28"
      />
    </NuxtLink>

    <!-- Filters -->
    <AppModal
      v-model="filterOpen"
      max-width="md"
    >
      <div class="space-y-6">
        <h3 class="pr-10 text-lg font-bold text-slate-900 dark:text-white">
          Filters
        </h3>
        <div class="space-y-4">
          <div>
            <label
              for="admin-events-filter-status"
              class="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >Status</label>
            <select
              id="admin-events-filter-status"
              v-model="selectedStatus"
              class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option
                v-for="o in statusOptions"
                :key="o.label"
                :value="o.value"
              >
                {{ o.label }}
              </option>
            </select>
          </div>
          <div>
            <label
              for="admin-events-filter-category"
              class="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >Category</label>
            <p class="mb-1.5 text-xs text-slate-500 dark:text-slate-400">
              Matches any primary category tag
            </p>
            <input
              id="admin-events-filter-category"
              v-model="selectedCategory"
              type="text"
              placeholder="e.g. nightlife, conference"
              class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
            >
          </div>
        </div>
        <div class="flex flex-wrap justify-end gap-2 pt-2">
          <AppButton
            color="neutral"
            @click="clearFilters"
          >
            Clear
          </AppButton>
          <AppButton @click="applyFilters">
            Apply
          </AppButton>
        </div>
      </div>
    </AppModal>

    <!-- Preview -->
    <AppModal
      v-model="previewOpen"
      max-width="lg"
      align="top"
    >
      <div
        v-if="previewEvent"
        class="max-h-[min(75vh,640px)] space-y-4 overflow-y-auto pr-1 text-sm"
      >
        <div class="pr-8">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            {{ previewEvent.title }}
          </h3>
          <p class="mt-1 text-sm text-slate-500">
            Submitted {{ new Date(previewEvent.created_at).toLocaleString() }}
          </p>
        </div>
        <div class="space-y-4">
          <div
            v-if="previewEvent.cover_image"
            class="overflow-hidden rounded-xl"
          >
            <img
              :src="getEventImage(previewEvent)"
              :alt="previewEvent.title"
              class="max-h-48 w-full object-cover"
            >
          </div>
          <p class="text-slate-600 dark:text-slate-300">
            {{ previewEvent.short_description || previewEvent.description?.slice(0, 280) }}{{ (previewEvent.description?.length || 0) > 280 ? '…' : '' }}
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="cat in previewEvent.categories"
              :key="cat"
              class="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {{ cat }}
            </span>
          </div>
        </div>
        <div
          v-if="previewEvent.status === 'draft'"
          class="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-6 dark:border-slate-800"
        >
          <AppButton
            color="neutral"
            :disabled="rejectLoading"
            @click="handleReject(previewEvent)"
          >
            <span class="inline-flex items-center gap-2">
              <AppLucideIcon
                v-if="rejectLoading"
                name="i-lucide-loader-2"
                :size="18"
                class="animate-spin"
              />
              Reject
            </span>
          </AppButton>
          <AppButton @click="handleApprove(previewEvent)">
            Approve
          </AppButton>
        </div>
      </div>
    </AppModal>

    <ConfirmModal
      :open="isOpen"
      :title="options?.title || ''"
      :message="options?.message || ''"
      :confirm-text="options?.confirmText"
      :variant="options?.variant"
      :loading="rejectLoading"
      @update:open="handleCancel"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>
