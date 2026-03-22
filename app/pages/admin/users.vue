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
const openActionMenuId = ref<string | null>(null)
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

function formatJoined(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })
}

function displayUserId(user: User): string {
  const compact = user.id.replace(/-/g, '').slice(0, 4).toUpperCase()
  return `EH-${compact}`
}

function primaryRole(user: User): UserRole | null {
  const r = user.roles?.[0]
  if (r === 'Admin' || r === 'Organizer' || r === 'Attendee') return r
  return null
}

function statusDisplay(user: User): { label: string; dot: string; pill: string } {
  if (user.status === 'suspended') {
    return {
      label: 'Blocked',
      dot: 'bg-rose-500',
      pill: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
    }
  }
  if (user.status === 'active') {
    return {
      label: 'Active',
      dot: 'bg-emerald-500',
      pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
    }
  }
  if (user.status === 'pending') {
    return {
      label: 'Pending',
      dot: 'bg-amber-500',
      pill: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
    }
  }
  return {
    label: user.status,
    dot: 'bg-slate-400',
    pill: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }
}

function rolePillClass(role: UserRole | null): string {
  if (role === 'Organizer') {
    return 'bg-primary-50 text-primary-700 ring-1 ring-primary-100 dark:bg-primary-950/40 dark:text-primary-300 dark:ring-primary-900'
  }
  if (role === 'Admin') {
    return 'bg-violet-50 text-violet-700 ring-1 ring-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900'
  }
  return 'bg-sky-50 text-sky-800 ring-1 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900'
}

async function handleDeleteUser(user: User) {
  openActionMenuId.value = null
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

function exportCsv() {
  const headers = ['Name', 'Email', 'Role', 'Status', 'Joined']
  const rows = usersStore.users.map((u) => {
    const role = u.roles?.[0] ?? ''
    return [
      getFullName(u),
      u.email,
      role,
      u.status,
      new Date(u.created_at).toISOString()
    ]
  })
  const escape = (cell: string) => `"${String(cell).replace(/"/g, '""')}"`
  const csv = [headers.join(','), ...rows.map(r => r.map(escape).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  notifications.success({ title: 'Export started', description: 'Your CSV download should begin shortly.' })
}

function goToPendingReviews() {
  tab.value = 'all'
  selectedRole.value = ''
  selectedStatus.value = 'pending'
  usersStore.setPage(1)
  loadUsers()
}

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

function closeActionMenu() {
  openActionMenuId.value = null
}

onMounted(() => {
  loadDirectoryStats()
  if (adminHeaderSearch.value) {
    searchQuery.value = adminHeaderSearch.value
  }
  loadUsers()
  window.addEventListener('click', closeActionMenu)
})

onUnmounted(() => {
  window.removeEventListener('click', closeActionMenu)
})

const paginationFrom = computed(() => {
  const { page, per_page, total } = usersStore.pagination
  if (total === 0) return 0
  return (page - 1) * per_page + 1
})

const paginationTo = computed(() => {
  const { page, per_page, total } = usersStore.pagination
  return Math.min(page * per_page, total)
})

const pagesToShow = computed(() =>
  visiblePages(usersStore.pagination.page, usersStore.pagination.last_page)
)
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

    <!-- Table card -->
    <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            :class="[
              'rounded-full px-4 py-2 text-xs font-bold transition-colors',
              tab === 'all'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            ]"
            @click="setTab('all')"
          >
            All users
          </button>
          <button
            type="button"
            :class="[
              'rounded-full px-4 py-2 text-xs font-bold transition-colors',
              tab === 'organizers'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            ]"
            @click="setTab('organizers')"
          >
            Organizers
          </button>
          <button
            type="button"
            :class="[
              'rounded-full px-4 py-2 text-xs font-bold transition-colors',
              tab === 'attendees'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            ]"
            @click="setTab('attendees')"
          >
            Attendees
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <label class="sr-only">Filter by status</label>
          <div class="relative">
            <select
              v-model="selectedStatus"
              class="appearance-none rounded-xl border border-slate-200 bg-sky-50/80 py-2 pl-3 pr-9 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              @change="usersStore.setPage(1); loadUsers()"
            >
              <option value="">
                Status: All
              </option>
              <option value="active">
                Status: Active
              </option>
              <option value="pending">
                Status: Pending
              </option>
              <option value="inactive">
                Status: Inactive
              </option>
              <option value="suspended">
                Status: Suspended
              </option>
            </select>
            <svg
              class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            @click="exportCsv"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line
                x1="12"
                x2="12"
                y1="15"
                y2="3"
              />
            </svg>
            Export
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-[900px] w-full border-collapse text-left">
          <thead>
            <tr class="bg-slate-50/90 dark:bg-slate-800/50">
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                User
              </th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Contact
              </th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Role
              </th>
              <th class="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Status
              </th>
              <th class="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="usersStore.loading">
              <td
                colspan="5"
                class="px-5 py-16"
              >
                <div class="flex flex-col items-center justify-center gap-3">
                  <div
                    class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"
                    role="status"
                    aria-label="Loading"
                  />
                  <p class="text-sm font-medium text-slate-500">
                    Loading users…
                  </p>
                </div>
              </td>
            </tr>
            <tr v-else-if="usersStore.users.length === 0">
              <td
                colspan="5"
                class="px-5 py-16"
              >
                <div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="mb-3 h-10 w-10 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
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
                  <p class="font-bold text-slate-900 dark:text-white">
                    No users found
                  </p>
                  <p class="mt-1 text-sm text-slate-500">
                    Try another tab, status filter, or search.
                  </p>
                </div>
              </td>
            </tr>
            <tr
              v-for="(u, index) in usersStore.users"
              v-else
              :key="u.id"
              :class="[
                'border-t border-slate-100 dark:border-slate-800',
                index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/40 dark:bg-slate-900/80'
              ]"
            >
              <td class="px-5 py-4 align-middle">
                <div class="flex items-center gap-3">
                  <img
                    v-if="u.avatar"
                    :src="u.avatar"
                    :alt="getFullName(u)"
                    class="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
                  >
                  <div
                    v-else
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-950/50 dark:text-primary-300"
                  >
                    {{ (u.first_name?.[0] || '') + (u.last_name?.[0] || '?') }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-slate-900 dark:text-white">
                      {{ getFullName(u) }}
                    </p>
                    <p class="text-xs font-medium text-slate-400">
                      ID: {{ displayUserId(u) }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 align-middle">
                <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {{ u.email }}
                </p>
                <p class="text-xs font-medium text-slate-400">
                  Joined {{ formatJoined(u.created_at) }}
                </p>
              </td>
              <td class="px-5 py-4 align-middle">
                <span
                  v-if="primaryRole(u)"
                  class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                  :class="rolePillClass(primaryRole(u))"
                >
                  <svg
                    v-if="primaryRole(u) === 'Organizer'"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.3 7-6-4.6-6 4.6 2.3-7-6-4.8h7.6z" />
                  </svg>
                  <svg
                    v-else-if="primaryRole(u) === 'Attendee'"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                    />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                  {{ primaryRole(u) }}
                </span>
                <span
                  v-else
                  class="text-xs font-medium text-slate-400"
                >—</span>
              </td>
              <td class="px-5 py-4 align-middle">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                  :class="statusDisplay(u).pill"
                >
                  <span
                    class="h-1.5 w-1.5 shrink-0 rounded-full"
                    :class="statusDisplay(u).dot"
                  />
                  {{ statusDisplay(u).label }}
                </span>
              </td>
              <td class="px-5 py-4 align-middle text-right">
                <div class="relative inline-flex justify-end">
                  <button
                    type="button"
                    class="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                    :aria-expanded="openActionMenuId === u.id"
                    aria-label="Open actions"
                    @click.stop="openActionMenuId = openActionMenuId === u.id ? null : u.id"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="5"
                        r="2"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="2"
                      />
                      <circle
                        cx="12"
                        cy="19"
                        r="2"
                      />
                    </svg>
                  </button>
                  <div
                    v-if="openActionMenuId === u.id"
                    class="absolute right-0 top-full z-[60] mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                    @click.stop
                  >
                    <NuxtLink
                      :to="`/admin/users/${u.id}`"
                      class="block px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      @click="openActionMenuId = null"
                    >
                      View
                    </NuxtLink>
                    <NuxtLink
                      :to="`/admin/users/${u.id}/edit`"
                      class="block px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      @click="openActionMenuId = null"
                    >
                      Edit
                    </NuxtLink>
                    <button
                      type="button"
                      class="w-full px-4 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                      @click="handleDeleteUser(u)"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Showing {{ paginationFrom }}-{{ paginationTo }} of {{ usersStore.pagination.total.toLocaleString() }} users
        </p>
        <nav
          v-if="usersStore.pagination.last_page > 1"
          class="flex flex-wrap items-center justify-center gap-1"
          aria-label="Pagination"
        >
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-600 enabled:hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:enabled:hover:bg-slate-800"
            :disabled="usersStore.pagination.page <= 1"
            @click="usersStore.setPage(usersStore.pagination.page - 1); loadUsers()"
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
                p === usersStore.pagination.page
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              ]"
              @click="usersStore.setPage(p); loadUsers()"
            >
              {{ p }}
            </button>
          </template>
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-600 enabled:hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:enabled:hover:bg-slate-800"
            :disabled="usersStore.pagination.page >= usersStore.pagination.last_page"
            @click="usersStore.setPage(usersStore.pagination.page + 1); loadUsers()"
          >
            ›
          </button>
        </nav>
      </div>
    </div>

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
