<script setup lang="ts">
import type { PaginatedResponse, PlatformRole, User, UserRole, UserStatus } from '~/types'
import { getFullName } from '~/types'
import AppModal from '~/components/common/AppModal.vue'

interface Pagination {
  total: number
  page: number
  per_page: number
  last_page: number
}

const props = defineProps<{
  users: User[]
  loading: boolean
  pagination: Pagination
  activeRole: UserRole | ''
  selectedStatus: UserStatus | ''
}>()

const emit = defineEmits<{
  'role-select': [role: UserRole | '']
  'status-change': [status: UserStatus | '']
  'page-change': [page: number]
  delete: [user: User]
  'directory-refresh': []
}>()

const usersStore = useUsersStore()
const notifications = useNotifications()
const api = useApi()

const openActionMenuId = ref<string | null>(null)
const assignRoleOpen = ref(false)
const userForRole = ref<User | null>(null)
/** Selected API role id from `GET /roles/`. */
const roleToAssign = ref<string>('')
const assignableRoles = ref<PlatformRole[]>([])
const rolesLoading = ref(false)
const assignRoleLoading = ref(false)

function normalizeUserRoleName(name: string): UserRole | null {
  const n = name.trim().toLowerCase()
  if (n === 'admin') return 'Admin'
  if (n === 'organizer') return 'Organizer'
  if (n === 'attendee') return 'Attendee'
  return null
}

const roleButtons = computed<UserRole[]>(() => {
  const out: UserRole[] = []
  for (const r of assignableRoles.value) {
    const normalized = normalizeUserRoleName(r.name)
    if (normalized && !out.includes(normalized)) out.push(normalized)
  }
  return out
})

function parseRoleRow(row: unknown): PlatformRole | null {
  if (!row || typeof row !== 'object') return null
  const o = row as Record<string, unknown>
  const id = o.id != null ? String(o.id) : ''
  const rawName = o.name ?? o.title
  const name = rawName != null ? String(rawName) : ''
  if (!id || !name) return null
  return { id, name }
}

function normalizeRolesResponse(res: unknown): PlatformRole[] {
  if (Array.isArray(res)) {
    return res.map(parseRoleRow).filter((r): r is PlatformRole => r != null)
  }
  if (res && typeof res === 'object' && 'data' in res) {
    const data = (res as { data: unknown }).data
    if (Array.isArray(data)) {
      return data.map(parseRoleRow).filter((r): r is PlatformRole => r != null)
    }
  }
  return []
}

async function loadAssignableRoles() {
  rolesLoading.value = true
  try {
    const res = await api.get<PaginatedResponse<PlatformRole> | PlatformRole[]>(
      '/roles/',
      { suppressErrorToast: true }
    )
    assignableRoles.value = normalizeRolesResponse(res)
  }
  catch {
    assignableRoles.value = []
    notifications.error({
      title: 'Could not load roles',
      description: 'Roles list is unavailable. Try refreshing the page.'
    })
  }
  finally {
    rolesLoading.value = false
  }
}

function roleNameMatchesUserRole(apiName: string, userRole: UserRole): boolean {
  return apiName.trim().toLowerCase() === userRole.toLowerCase()
}

function closeActionMenu() {
  openActionMenuId.value = null
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
  const r = user.primary_role?.name
  if (!r) return null
  return normalizeUserRoleName(r)
}

const visibleUsers = computed<User[]>(() => {
  if (!props.activeRole) return props.users
  // Filter based on the user's primary role.
  return props.users.filter((u) => primaryRole(u) === props.activeRole)
})

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

const paginationFrom = computed(() => {
  const { page, per_page, total } = props.pagination
  if (total === 0) return 0
  return (page - 1) * per_page + 1
})

const paginationTo = computed(() => {
  const { page, per_page, total } = props.pagination
  return Math.min(page * per_page, total)
})

const pagesToShow = computed(() =>
  visiblePages(props.pagination.page, props.pagination.last_page)
)

function exportCsv() {
  const headers = ['Name', 'Email', 'Role', 'Status', 'Joined']
  const rows = visibleUsers.value.map((u) => {
    const role = primaryRole(u) ?? ''
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

function onStatusSelectChange(e: Event) {
  const v = (e.target as HTMLSelectElement).value as UserStatus | ''
  emit('status-change', v)
}

function goPage(p: number) {
  emit('page-change', p)
}

async function openAssignRole(user: User) {
  openActionMenuId.value = null
  userForRole.value = user
  if (assignableRoles.value.length === 0 && !rolesLoading.value) {
    await loadAssignableRoles()
  }
  const primary = primaryRole(user)
  const match = primary
    ? assignableRoles.value.find(r => roleNameMatchesUserRole(r.name, primary))
    : null
  roleToAssign.value = match?.id ?? assignableRoles.value[0]?.id ?? ''
  assignRoleOpen.value = true
}

async function submitAssignRole() {
  if (!userForRole.value || !roleToAssign.value) return
  const roleLabel = assignableRoles.value.find(r => r.id === roleToAssign.value)?.name ?? 'updated'
  assignRoleLoading.value = true
  try {
    await usersStore.setUserPrimaryRole(userForRole.value.id, roleToAssign.value)
    notifications.success({
      title: 'Role updated',
      description: `${getFullName(userForRole.value)} is now ${roleLabel}.`
    })
    assignRoleOpen.value = false
    userForRole.value = null
    emit('directory-refresh')
  }
  catch {
    notifications.error({ title: 'Could not update role', description: 'Try again or check your permissions.' })
  }
  finally {
    assignRoleLoading.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', closeActionMenu)
  loadAssignableRoles()
})

onUnmounted(() => {
  window.removeEventListener('click', closeActionMenu)
})
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div class="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          :class="[
            'rounded-full px-4 py-2 text-xs font-bold transition-colors',
            activeRole === ''
              ? 'bg-primary-500 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          ]"
          @click="emit('role-select', '')"
        >
          All users
        </button>
        <button
          v-if="rolesLoading && roleButtons.length === 0"
          type="button"
          disabled
          class="rounded-full px-4 py-2 text-xs font-bold text-slate-400 shadow-sm opacity-70 dark:text-slate-400"
        >
          Loading roles…
        </button>
        <button
          v-for="role in roleButtons"
          :key="role"
          type="button"
          :class="[
            'rounded-full px-4 py-2 text-xs font-bold transition-colors',
            activeRole === role
              ? 'bg-primary-500 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          ]"
          @click="emit('role-select', role)"
        >
          {{ role }}
        </button>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <label class="sr-only">Filter by status</label>
        <div class="relative">
          <select
            :value="selectedStatus"
            class="appearance-none rounded-xl border border-slate-200 bg-sky-50/80 py-2 pl-3 pr-9 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            @change="onStatusSelectChange"
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
          <tr v-if="loading">
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
          <tr v-else-if="visibleUsers.length === 0">
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
                  Try another role, status filter, or search.
                </p>
              </div>
            </td>
          </tr>
          <tr
            v-for="(u, index) in visibleUsers"
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
                    class="w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    @click="openAssignRole(u)"
                  >
                    Assign role
                  </button>
                  <button
                    type="button"
                    class="w-full px-4 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    @click="openActionMenuId = null; emit('delete', u)"
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
        Showing {{ paginationFrom }}-{{ paginationTo }} of {{ pagination.total.toLocaleString() }} users
      </p>
      <nav
        v-if="pagination.last_page > 1"
        class="flex flex-wrap items-center justify-center gap-1"
        aria-label="Pagination"
      >
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-600 enabled:hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:enabled:hover:bg-slate-800"
          :disabled="pagination.page <= 1"
          @click="goPage(pagination.page - 1)"
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
              p === pagination.page
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            ]"
            @click="goPage(p)"
          >
            {{ p }}
          </button>
        </template>
        <button
          type="button"
          class="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-600 enabled:hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:enabled:hover:bg-slate-800"
          :disabled="pagination.page >= pagination.last_page"
          @click="goPage(pagination.page + 1)"
        >
          ›
        </button>
      </nav>
    </div>

    <AppModal
      v-model="assignRoleOpen"
      max-width="sm"
    >
      <div v-if="userForRole">
        <h2 class="pr-10 text-xl font-bold text-slate-900 dark:text-white">
          Assign role
        </h2>
        <p class="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          Choose the platform role for <span class="font-bold text-slate-900 dark:text-slate-200">{{ getFullName(userForRole) }}</span>.
        </p>
        <form
          class="mt-6 space-y-4"
          @submit.prevent="submitAssignRole"
        >
          <div>
            <label
              class="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >Role</label>
            <div
              :class="[
                'flex flex-wrap gap-2',
                rolesLoading ? 'opacity-70' : ''
              ]"
            >
              <button
                v-for="r in assignableRoles"
                :key="r.id"
                type="button"
                class="flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap"
                :class="roleToAssign === r.id
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-950/50 dark:text-primary-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600'
                "
                :disabled="rolesLoading"
                @click="roleToAssign = r.id"
              >
                {{ r.name }}
              </button>
            </div>
            <p
              v-if="rolesLoading"
              class="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
            >
              Loading roles…
            </p>
            <p
              v-else-if="assignableRoles.length === 0"
              class="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
            >
              No roles available
            </p>
          </div>
          <div class="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              @click="assignRoleOpen = false"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-600 disabled:opacity-50"
              :disabled="assignRoleLoading || !roleToAssign || assignableRoles.length === 0"
            >
              {{ assignRoleLoading ? 'Saving…' : 'Save role' }}
            </button>
          </div>
        </form>
      </div>
    </AppModal>
  </div>
</template>
