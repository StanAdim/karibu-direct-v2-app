<script setup lang="ts">
import type { User, UserRole, UserStatus, PaginatedResponse } from '~/types'
import { getFullName } from '~/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const usersStore = useUsersStore()
const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirmDialog()
const notifications = useNotifications()
const api = useApi()
const adminHeaderSearch = useState<string>('adminHeaderSearch', () => '')

const searchQuery = ref('')
const selectedRole = ref<UserRole | ''>('')
const selectedStatus = ref<UserStatus | ''>('')
const tab = ref<'all' | 'organizers' | 'attendees'>('all')
const deleteLoading = ref(false)
const userToDelete = ref<User | null>(null)
const chartRange = ref<'30d' | '90d'>('30d')

const directoryStats = ref({
  totalUsers: 0,
  activeNow: 0,
  pendingVerification: 0,
  organizerCount: 0,
  attendeeCount: 0
})
const statsLoading = ref(false)

/** Mock heights for registration velocity bars (last 30 slots). */
const velocityHeights = [40, 52, 38, 65, 48, 72, 55, 44, 68, 50, 58, 42, 75, 60, 48, 55, 70, 45, 62, 50, 58, 66, 44, 78, 52, 60, 48, 55, 50, 82]

async function loadDirectoryStats() {
  statsLoading.value = true
  try {
    const [allRes, activeRes, pendingRes, orgRes, attRes] = await Promise.all([
      api.get<PaginatedResponse<User>>('/users/?page=1&per_page=1'),
      api.get<PaginatedResponse<User>>('/users/?page=1&per_page=1&status=active'),
      api.get<PaginatedResponse<User>>('/users/?page=1&per_page=1&status=pending'),
      api.get<PaginatedResponse<User>>('/users/?page=1&per_page=1&role=Organizer'),
      api.get<PaginatedResponse<User>>('/users/?page=1&per_page=1&role=Attendee')
    ])
    directoryStats.value = {
      totalUsers: allRes.meta?.total ?? 0,
      activeNow: activeRes.meta?.total ?? 0,
      pendingVerification: pendingRes.meta?.total ?? 0,
      organizerCount: orgRes.meta?.total ?? 0,
      attendeeCount: attRes.meta?.total ?? 0
    }
  }
  catch {
    /* keep zeros */
  }
  finally {
    statsLoading.value = false
  }
}

const organizerSharePercent = computed(() => {
  const o = directoryStats.value.organizerCount
  const a = directoryStats.value.attendeeCount
  const sum = o + a
  if (sum === 0) return 6
  return Math.round((o / sum) * 1000) / 10
})

const ratioLabel = computed(() => {
  const o = directoryStats.value.organizerCount
  const a = directoryStats.value.attendeeCount
  if (o <= 0) return '1:15'
  const r = Math.max(1, Math.round(a / o))
  return `1:${r}`
})

async function loadUsers() {
  await usersStore.fetchUsers({
    role: selectedRole.value || undefined,
    status: selectedStatus.value || undefined,
    search: searchQuery.value || undefined
  })
}

function setTab(t: 'all' | 'organizers' | 'attendees') {
  tab.value = t
  if (t === 'all') selectedRole.value = ''
  else if (t === 'organizers') selectedRole.value = 'Organizer'
  else selectedRole.value = 'Attendee'
  usersStore.setPage(1)
  loadUsers()
}

function onStatusChange(s: UserStatus | '') {
  selectedStatus.value = s
  usersStore.setPage(1)
  loadUsers()
}

function onPageChange(page: number) {
  usersStore.setPage(page)
  loadUsers()
}

async function handleDeleteUser(user: User) {
  userToDelete.value = user
  const confirmed = await confirm({
    title: 'Delete User',
    message: `Are you sure you want to delete ${getFullName(user)}? This action cannot be undone.`,
    confirmText: 'Delete',
    variant: 'danger'
  })

  if (confirmed && userToDelete.value) {
    deleteLoading.value = true
    try {
      await usersStore.deleteUser(userToDelete.value.id)
      notifications.success({ title: 'User removed', description: `${getFullName(user)} was deleted.` })
      await Promise.all([loadUsers(), loadDirectoryStats()])
    }
    catch {
      notifications.error({ title: 'Delete failed' })
    }
    finally {
      deleteLoading.value = false
      userToDelete.value = null
    }
  }
}

function goToPendingReviews() {
  tab.value = 'all'
  selectedRole.value = ''
  selectedStatus.value = 'pending'
  usersStore.setPage(1)
  loadUsers()
}

async function onDirectoryRefresh() {
  await Promise.all([loadUsers(), loadDirectoryStats()])
}

watch(adminHeaderSearch, useDebounceFn((q) => {
  if (searchQuery.value === q) return
  searchQuery.value = q
  usersStore.setPage(1)
  loadUsers()
}, 350))

watch(searchQuery, (q) => {
  if (adminHeaderSearch.value !== q) {
    adminHeaderSearch.value = q
  }
})

onMounted(() => {
  loadDirectoryStats()
  if (adminHeaderSearch.value) {
    searchQuery.value = adminHeaderSearch.value
  }
  loadUsers()
})
</script>

<template>
  <div class="space-y-8 pb-8">
    <!-- Metric cards -->
    <div class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Total users
        </p>
        <div class="mt-2 flex items-end justify-between gap-3">
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
            {{ directoryStats.totalUsers.toLocaleString() }}
          </p>
          <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            +12%
          </span>
        </div>
      </div>
      <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Active now
        </p>
        <div class="mt-2 flex items-end justify-between gap-3">
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
            {{ directoryStats.activeNow.toLocaleString() }}
          </p>
          <span class="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span class="h-2 w-2 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>
      </div>
      <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Pending verification
        </p>
        <div class="mt-2 flex items-end justify-between gap-3">
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
            {{ directoryStats.pendingVerification.toLocaleString() }}
          </p>
          <button
            type="button"
            class="text-sm font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400"
            @click="goToPendingReviews"
          >
            Review all
          </button>
        </div>
      </div>
    </div>

    <!-- Title + add -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          User directory
        </h1>
        <p class="mt-1 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
          Manage platform participants, organizers, and their access levels.
        </p>
      </div>
      <NuxtLink
        to="/admin/users/create"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-500/25 transition hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        Add user
      </NuxtLink>
    </div>

    <AdminUsersTable
      :users="usersStore.users"
      :loading="usersStore.loading"
      :pagination="usersStore.pagination"
      :tab="tab"
      :selected-status="selectedStatus"
      @tab-select="setTab"
      @status-change="onStatusChange"
      @page-change="onPageChange"
      @delete="handleDeleteUser"
      @directory-refresh="onDirectoryRefresh"
    />

    <!-- Bottom widgets -->
    <div class="grid gap-6 lg:grid-cols-5">
      <div class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            Registration velocity
          </h2>
          <label class="sr-only">Chart range</label>
          <select
            v-model="chartRange"
            class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="30d">
              Last 30 days
            </option>
            <option value="90d">
              Last 90 days
            </option>
          </select>
        </div>
        <div class="mt-6 h-48 w-full">
          <svg
            class="h-full w-full text-primary-300 dark:text-primary-800"
            preserveAspectRatio="none"
            viewBox="0 0 300 120"
          >
            <rect
              v-for="(h, i) in velocityHeights"
              :key="i"
              :x="4 + i * 9.2"
              :y="110 - h * 1.1"
              width="6"
              :height="h * 1.1"
              :class="i === 29 ? 'fill-primary-500 dark:fill-primary-400' : 'fill-current'"
              rx="2"
            />
          </svg>
        </div>
      </div>
      <div class="rounded-2xl bg-primary-600 p-6 text-white shadow-lg shadow-primary-600/25 dark:bg-primary-700 lg:col-span-2">
        <div class="flex items-start gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle
                cx="9"
                cy="7"
                r="4"
              />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold">
              Organizer-to-attendee ratio
            </h2>
            <p class="mt-1 text-sm font-medium text-white/85">
              Platform healthy balance maintained at {{ ratioLabel }}
            </p>
          </div>
        </div>
        <div class="mt-6">
          <div class="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-white/80">
            <span>Organizers</span>
            <span>{{ organizerSharePercent }}%</span>
          </div>
          <div class="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">
            <div
              class="h-full rounded-full bg-white transition-all duration-500"
              :style="{ width: `${Math.min(100, organizerSharePercent)}%` }"
            />
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal
      :open="isOpen"
      :title="options?.title || ''"
      :message="options?.message || ''"
      :confirm-text="options?.confirmText"
      :variant="options?.variant"
      :loading="deleteLoading"
      @update:open="handleCancel"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>
