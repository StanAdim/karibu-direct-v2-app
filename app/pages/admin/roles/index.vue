<script setup lang="ts">

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const api = useApi()
const notifications = useNotifications()
const adminHeaderSearch = useState<string>('adminHeaderSearch', () => '')
const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirmDialog()

type RoleStatus = 'active' | 'inactive' | 'pending' | string

interface RoleRow {
  id: string
  name: string
  description?: string | null
  status?: RoleStatus | boolean | null
  permissions?: string[] | null
  user_count?: number | null
  users_count?: number | null
  members_count?: number | null
}

type PaginationState = {
  total: number
  page: number
  per_page: number
  last_page: number
}

const roles = ref<RoleRow[]>([])
const rolesLoading = ref(false)

const pagination = ref<PaginationState>({
  total: 0,
  page: 1,
  per_page: 10,
  last_page: 1
})

const searchQuery = ref('')

const openActionMenuId = ref<string | null>(null)
function closeActionMenu() {
  openActionMenuId.value = null
}

function safeString(v: unknown): string {
  return v == null ? '' : String(v)
}

function safeNumber(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

function normalizeRole(row: unknown): RoleRow | null {
  if (!row || typeof row !== 'object') return null
  const o = row as Record<string, unknown>

  const idRaw = o.id ?? o.role_id ?? o.uuid
  const nameRaw = o.name ?? o.title ?? o.label

  const id = idRaw != null ? String(idRaw) : ''
  const name = nameRaw != null ? String(nameRaw) : ''
  if (!id || !name) return null

  const perms = o.permissions ?? o.permissions_list ?? o.permission_clusters ?? o.permission_tags
  const permissions = Array.isArray(perms) ? perms.map(String) : null

  const status = (o.status ?? o.is_active ?? o.state ?? null) as RoleRow['status']
  const descriptionRaw = o.description ?? o.details ?? o.summary
  const description = descriptionRaw == null ? null : safeString(descriptionRaw) || null
  const userCountRaw = o.user_count ?? o.users_count
  const user_count = userCountRaw == null ? null : safeNumber(userCountRaw)
  const users_count = o.users_count == null ? null : safeNumber(o.users_count)
  const members_count = o.members_count == null ? null : safeNumber(o.members_count)

  return {
    id,
    name,
    description,
    status,
    permissions,
    user_count,
    users_count,
    members_count
  }
}

function normalizeRolesResponse(res: unknown): { items: RoleRow[]; total: number; page: number; last_page: number } {
  if (Array.isArray(res)) {
    const items = res.map(normalizeRole).filter((r): r is RoleRow => r != null)
    return { items, total: items.length, page: 1, last_page: 1 }
  }

  if (res && typeof res === 'object' && 'data' in res && 'meta' in res) {
    const data = (res as { data: unknown }).data
    const meta = (res as { meta: any }).meta
    const items = Array.isArray(data) ? data.map(normalizeRole).filter((r): r is RoleRow => r != null) : []
    return {
      items,
      total: safeNumber(meta?.total),
      page: safeNumber(meta?.page) || 1,
      last_page: safeNumber(meta?.last_page) || 1
    }
  }

  // Fallback for unexpected API shapes
  const items: RoleRow[] = []
  return { items, total: 0, page: 1, last_page: 1 }
}

function formatCompactCount(n: number): string {
  const safe = Math.max(0, Math.floor(n))
  return safe < 10 ? `0${safe}` : String(safe)
}

function roleInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean)
  const letters = words.slice(0, 2).map(w => w[0]?.toUpperCase()).filter(Boolean)
  const out = letters.join('')
  return out || name.slice(0, 2).toUpperCase()
}

function getRoleUsersCount(r: RoleRow): number {
  // Try a few common fields, but never crash if absent.
  return (
    safeNumber(r.user_count) ||
    safeNumber(r.users_count) ||
    safeNumber(r.members_count)
  )
}

function normalizeStatus(status: RoleRow['status']): { kind: 'active' | 'inactive' | 'pending'; label: string } {
  if (typeof status === 'boolean') {
    return { kind: status ? 'active' : 'inactive', label: status ? 'Active' : 'Inactive' }
  }
  const s = safeString(status).toLowerCase()
  if (s.includes('pending')) return { kind: 'pending', label: 'Pending' }
  if (s.includes('inactive') || s.includes('disabled')) return { kind: 'inactive', label: 'Inactive' }
  if (s.includes('active')) return { kind: 'active', label: 'Active' }
  // Default: most restrictive state is "inactive"
  return { kind: 'inactive', label: 'Inactive' }
}

function statusDotClass(kind: ReturnType<typeof normalizeStatus>['kind']): string {
  if (kind === 'active') return 'bg-emerald-500'
  if (kind === 'pending') return 'bg-amber-500'
  return 'bg-slate-400'
}

function statusPillClass(kind: ReturnType<typeof normalizeStatus>['kind']): string {
  if (kind === 'active') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
  if (kind === 'pending') return 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

function prettifyPermission(p: string): string {
  const cleaned = p
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim()
  if (!cleaned) return p
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function getPermissionTags(r: RoleRow): string[] {
  const perms = Array.isArray(r.permissions) ? r.permissions.filter(Boolean) : []
  if (perms.length > 0) {
    const first = perms.slice(0, 2).map(prettifyPermission)
    const remaining = perms.length - first.length
    if (remaining > 0) first.push(`+${remaining} more`)
    return first
  }

  const name = r.name.toLowerCase()
  if (name.includes('admin')) return ['All Access', 'Root']
  if (name.includes('organizer') || name.includes('moderator')) return ['Approve Events', 'Ban Users', '+2 more']
  if (name.includes('support')) return ['Read User Data', 'Ticketing']
  if (name.includes('financial') || name.includes('auditor')) return ['View Revenue', 'Export CSV']

  return ['Read Access', 'Write Access']
}

const pagesToShow = computed(() => {
  const current = pagination.value.page
  const last = pagination.value.last_page
  if (last <= 1) return [1] as (number | 'ellipsis')[]
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)

  const pages: (number | 'ellipsis')[] = []
  const push = (p: number | 'ellipsis') => {
    if (pages.length && pages[pages.length - 1] === p && p === 'ellipsis') return
    pages.push(p)
  }
  push(1)
  if (current > 3) push('ellipsis')
  for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) push(i)
  if (current < last - 2) push('ellipsis')
  push(last)
  return pages
})

const paginationFrom = computed(() => {
  const total = pagination.value.total
  if (total === 0) return 0
  return (pagination.value.page - 1) * pagination.value.per_page + 1
})

const paginationTo = computed(() => {
  const { page, per_page, total } = pagination.value
  return Math.min(page * per_page, total)
})

async function loadRoles() {
  rolesLoading.value = true
  try {
    const params = new URLSearchParams()
    params.append('page', String(pagination.value.page))
    params.append('per_page', String(pagination.value.per_page))
    if (searchQuery.value) params.append('search', searchQuery.value)

    const res = await api.get<unknown>(`/roles/?${params.toString()}`, {
      suppressErrorToast: true
    })

    const normalized = normalizeRolesResponse(res)
    roles.value = normalized.items
    pagination.value.total = normalized.total
    pagination.value.page = normalized.page
    pagination.value.last_page = normalized.last_page
  }
  catch {
    roles.value = []
    pagination.value.total = 0
    pagination.value.page = 1
    pagination.value.last_page = 1
  }
  finally {
    rolesLoading.value = false
  }
}

function moveToPage(p: number) {
  pagination.value.page = p
  loadRoles()
}

watch(
  adminHeaderSearch,
  useDebounceFn((q) => {
    if (searchQuery.value === q) return
    searchQuery.value = q
    pagination.value.page = 1
    loadRoles()
  }, 350)
)

watch(searchQuery, (q) => {
  if (adminHeaderSearch.value !== q) adminHeaderSearch.value = q
})

// --- Create/Edit modal ---
const roleModalOpen = ref(false)
type RoleModalMode = 'create' | 'edit'
const roleModalMode = ref<RoleModalMode>('create')
const roleModalLoading = ref(false)

const roleForm = reactive({
  name: '',
  description: '',
  status: 'active' as RoleStatus
})

const roleForEdit = ref<RoleRow | null>(null)

function resetRoleForm() {
  roleForm.name = ''
  roleForm.description = ''
  roleForm.status = 'active'
  roleForEdit.value = null
}

function openCreateRole() {
  roleModalMode.value = 'create'
  resetRoleForm()
  roleModalOpen.value = true
}

function openEditRole(r: RoleRow) {
  roleModalMode.value = 'edit'
  roleForEdit.value = r
  roleForm.name = r.name
  roleForm.description = safeString(r.description)
  roleForm.status = (typeof r.status === 'string' ? r.status : normalizeStatus(r.status).kind) as RoleStatus
  roleModalOpen.value = true
}

async function submitRole() {
  const name = roleForm.name.trim()
  if (!name) {
    notifications.error({ title: 'Role name is required' })
    return
  }

  roleModalLoading.value = true
  try {
    if (roleModalMode.value === 'create') {
      await api.post('/roles/', {
        name,
        description: roleForm.description.trim() || undefined,
        status: roleForm.status
      }, { suppressErrorToast: false })
      notifications.success({ title: 'Role created' })
    }
    else if (roleModalMode.value === 'edit' && roleForEdit.value) {
      await api.patch(`/roles/${roleForEdit.value.id}`, {
        name,
        description: roleForm.description.trim() || undefined,
        status: roleForm.status
      }, { suppressErrorToast: false })
      notifications.success({ title: 'Role updated' })
    }

    roleModalOpen.value = false
    resetRoleForm()
    await loadRoles()
  }
  catch {
    notifications.error({ title: 'Could not save role' })
  }
  finally {
    roleModalLoading.value = false
  }
}

// --- Delete ---
const deleteLoading = ref(false)
const roleToDelete = ref<RoleRow | null>(null)

async function handleDeleteRole(r: RoleRow) {
  openActionMenuId.value = null
  roleToDelete.value = r

  const ok = await confirm({
    title: 'Delete Role',
    message: `Are you sure you want to delete "${r.name}"? This action cannot be undone.`,
    confirmText: 'Delete',
    variant: 'danger'
  })

  if (!ok || !roleToDelete.value) return
  deleteLoading.value = true
  try {
    await api.delete(`/roles/${roleToDelete.value.id}`, { suppressErrorToast: false })
    notifications.success({ title: 'Role deleted' })
    await loadRoles()
  }
  catch {
    notifications.error({ title: 'Delete failed' })
  }
  finally {
    deleteLoading.value = false
    roleToDelete.value = null
  }
}

// --- Stats ---
const stats = computed(() => {
  const totalRoles = pagination.value.total || roles.value.length
  const active = roles.value.filter(r => normalizeStatus(r.status).kind === 'active').length
  const pending = roles.value.filter(r => normalizeStatus(r.status).kind === 'pending').length
  return { totalRoles, active, pending }
})

function dummyFilter() {
  notifications.info({ title: 'Filter coming soon', description: 'This action is UI-only for now.' })
}

function helpInfo() {
  notifications.info({
    title: 'Role management',
    description: 'Use the table actions to edit/delete roles. Create new roles with the CTA on the right.'
  })
}

onMounted(() => {
  window.addEventListener('click', closeActionMenu)
  loadRoles()

  if (adminHeaderSearch.value) {
    searchQuery.value = adminHeaderSearch.value
  }
})

onUnmounted(() => {
  window.removeEventListener('click', closeActionMenu)
})
</script>

<template>
  <div class="space-y-10 pb-10">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Role Management
        </h1>
        <p class="mt-1 max-w-xl text-sm font-medium text-slate-600 dark:text-slate-400">
          Define and control access levels across the platform.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition hover:bg-primary-600 active:scale-95"
        @click="openCreateRole"
      >
        <span class="material-symbols-outlined text-lg">add_circle</span>
        Create New Role
      </button>
    </div>

    <!-- Metric cards -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div class="rounded-[1.75rem] border border-primary-500/10 bg-white p-6 shadow-sm dark:bg-slate-900">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Total Roles
            </p>
            <p class="mt-1 text-3xl font-black text-slate-900 dark:text-white">
              {{ formatCompactCount(stats.totalRoles) }}
            </p>
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-600">
            <AppLucideIcon name="i-lucide-shield" :size="22" class="text-primary-600" />
          </div>
        </div>
      </div>

      <div class="rounded-[1.75rem] border border-tertiary/20 bg-white p-6 shadow-sm dark:bg-slate-900">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Active Admins
            </p>
            <p class="mt-1 text-3xl font-black text-slate-900 dark:text-white">
              {{ formatCompactCount(stats.active) }}
            </p>
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-tertiary/10 text-tertiary">
            <AppLucideIcon name="i-lucide-shield-check" :size="22" class="text-tertiary" />
          </div>
        </div>
      </div>

      <div class="rounded-[1.75rem] border border-secondary/20 bg-white p-6 shadow-sm dark:bg-slate-900">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Pending Requests
            </p>
            <p class="mt-1 text-3xl font-black text-slate-900 dark:text-white">
              {{ formatCompactCount(stats.pending) }}
            </p>
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
            <AppLucideIcon name="i-lucide-clock" :size="22" class="text-secondary" />
          </div>
        </div>
      </div>
    </section>

    <!-- Roles table -->
    <section class="overflow-hidden rounded-[2.5rem] bg-white shadow-sm dark:bg-slate-900">
      <div class="flex items-center justify-between gap-3 border-b border-slate-200/60 bg-white/60 px-8 py-6">
        <h2 class="flex items-center gap-3 text-lg font-extrabold text-slate-900">
          <span class="h-2 w-2 rounded-full bg-primary-500" />
          Access Control List
        </h2>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-primary-500 hover:text-white"
            title="Filter"
            @click="dummyFilter"
          >
            <span class="material-symbols-outlined text-base">filter_list</span>
          </button>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-primary-500 hover:text-white"
            title="More"
            @click="dummyFilter"
          >
            <span class="material-symbols-outlined text-base">more_vert</span>
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-[980px] w-full border-collapse text-left">
          <thead>
            <tr class="border-y border-slate-200/70 bg-slate-50/60 text-left dark:border-slate-800">
              <th class="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">
                Role &amp; Description
              </th>
              <th class="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 text-center">
                Users
              </th>
              <th class="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">
                Permissions Cluster
              </th>
              <th class="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">
                Status
              </th>
              <th class="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800">
            <tr v-if="rolesLoading">
              <td colspan="5" class="px-8 py-16">
                <div class="flex flex-col items-center justify-center gap-3">
                  <div
                    class="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"
                    role="status"
                    aria-label="Loading"
                  />
                  <p class="text-sm font-medium text-slate-500">Loading roles…</p>
                </div>
              </td>
            </tr>

            <tr v-else-if="roles.length === 0">
              <td colspan="5" class="px-8 py-16">
                <div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-8 py-12 text-center dark:border-slate-700 dark:bg-slate-800/30">
                  <span class="material-symbols-outlined text-5xl text-slate-400">admin_panel_settings</span>
                  <p class="mt-3 font-bold text-slate-900 dark:text-white">No roles found</p>
                  <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or try again.</p>
                </div>
              </td>
            </tr>

            <tr
              v-for="r in roles"
              v-else
              :key="r.id"
              class="group transition-colors hover:bg-primary/[0.02]"
            >
              <td class="px-8 py-6 align-middle">
                <div class="flex items-center gap-4">
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold transition group-hover:bg-primary group-hover:text-white"
                  >
                    {{ roleInitials(r.name) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-slate-900 dark:text-white">
                      {{ r.name }}
                    </p>
                    <p class="max-w-[320px] truncate text-xs text-slate-500 dark:text-slate-400">
                      {{ safeString(r.description) || '—' }}
                    </p>
                  </div>
                </div>
              </td>

              <td class="px-8 py-6 text-center align-middle">
                <span class="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-primary-700 dark:bg-slate-800 dark:text-primary-300">
                  {{ formatCompactCount(getRoleUsersCount(r)) }}
                </span>
              </td>

              <td class="px-8 py-6 align-middle">
                <div class="flex flex-wrap gap-1.5 max-w-[360px]">
                  <span
                    v-for="tag in getPermissionTags(r)"
                    :key="tag"
                    class="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-700 dark:bg-primary-950/40 dark:text-primary-300"
                  >
                    {{ tag }}
                  </span>
                </div>
              </td>

              <td class="px-8 py-6 align-middle">
                <span
                  class="inline-flex items-center gap-1.5 text-xs font-bold"
                  :class="statusPillClass(normalizeStatus(r.status).kind)"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="statusDotClass(normalizeStatus(r.status).kind)" />
                  {{ normalizeStatus(r.status).label }}
                </span>
              </td>

              <td class="px-8 py-6 text-right align-middle">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-primary-500 hover:text-white active:scale-95 transition"
                    aria-label="Edit role"
                    @click="openEditRole(r)"
                  >
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    type="button"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-rose-500 hover:text-white active:scale-95 transition"
                    aria-label="Delete role"
                    :disabled="deleteLoading && roleToDelete?.id === r.id"
                    @click="handleDeleteRole(r)"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-4 border-t border-slate-200/70 px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-xs font-medium text-slate-600">
          Showing {{ paginationFrom }}-{{ paginationTo }} of {{ pagination.total }} roles
        </p>
        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-lg bg-white px-4 py-2 text-xs font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="pagination.page <= 1"
            @click="moveToPage(pagination.page - 1)"
          >
            Previous
          </button>
          <button
            v-if="pagination.last_page > 1"
            type="button"
            class="rounded-lg bg-white px-4 py-2 text-xs font-bold shadow-sm hover:bg-primary-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="pagination.page >= pagination.last_page"
            @click="moveToPage(pagination.page + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </section>

    <!-- Permissions matrix preview -->
    <section class="mt-2">
      <h2 class="flex items-center gap-3 text-2xl font-extrabold text-slate-900 mb-6">
        <span class="material-symbols-outlined text-primary-500">security_update_good</span>
        Permissions Matrix Preview
      </h2>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div class="rounded-3xl border border-white/50 bg-white/70 p-6 dark:bg-slate-800/40">
          <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/15 text-primary-600">
            <span class="material-symbols-outlined">public</span>
          </div>
          <h4 class="mb-3 font-bold text-slate-900 dark:text-white">Global Management</h4>
          <ul class="space-y-2">
            <li class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span class="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
              Manage System Config
            </li>
            <li class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span class="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
              Edit Platform Brand
            </li>
            <li class="flex items-center gap-2 text-xs font-medium text-slate-600 opacity-40 dark:text-slate-300">
              <span class="material-symbols-outlined text-sm">cancel</span>
              Root Access
            </li>
          </ul>
        </div>

        <div class="rounded-3xl border border-white/50 bg-white/70 p-6 dark:bg-slate-800/40">
          <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-tertiary/15 text-tertiary">
            <span class="material-symbols-outlined">group_add</span>
          </div>
          <h4 class="mb-3 font-bold text-slate-900 dark:text-white">User Control</h4>
          <ul class="space-y-2">
            <li class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span class="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
              Create Users
            </li>
            <li class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span class="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
              Reset Passwords
            </li>
            <li class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span class="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
              Ban/Unban User
            </li>
          </ul>
        </div>

        <div class="rounded-3xl border border-white/50 bg-white/70 p-6 dark:bg-slate-800/40">
          <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
            <span class="material-symbols-outlined">edit_document</span>
          </div>
          <h4 class="mb-3 font-bold text-slate-900 dark:text-white">Content Ops</h4>
          <ul class="space-y-2">
            <li class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span class="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
              Approve Events
            </li>
            <li class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span class="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
              Feature Events
            </li>
            <li class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span class="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
              Delete Content
            </li>
          </ul>
        </div>

        <div class="rounded-3xl border border-white/50 bg-white/70 p-6 dark:bg-slate-800/40">
          <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <span class="material-symbols-outlined">payments</span>
          </div>
          <h4 class="mb-3 font-bold text-slate-900 dark:text-white">Financial Gate</h4>
          <ul class="space-y-2">
            <li class="flex items-center gap-2 text-xs font-medium text-slate-600 opacity-40 dark:text-slate-300">
              <span class="material-symbols-outlined text-sm">cancel</span>
              Process Payouts
            </li>
            <li class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span class="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
              View Audit Logs
            </li>
            <li class="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              <span class="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
              Revenue Insights
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Contextual FAB -->
    <button
      type="button"
      class="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl transition hover:scale-110 active:scale-95"
      title="Help"
      @click="helpInfo"
    >
      <span class="material-symbols-outlined text-2xl">help_outline</span>
    </button>

    <!-- Confirm (delete) -->
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

    <!-- Create/Edit modal -->
    <AppModal
      v-model="roleModalOpen"
      max-width="lg"
      align="top"
    >
      <div class="space-y-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-xl font-extrabold text-slate-900 dark:text-white">
              {{ roleModalMode === 'create' ? 'Create New Role' : 'Edit Role' }}
            </h2>
            <p class="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
              {{ roleModalMode === 'create' ? 'Define a new access role for the platform.' : 'Update role details and permissions metadata.' }}
            </p>
          </div>
          <span class="material-symbols-outlined text-slate-400">admin_panel_settings</span>
        </div>

        <form class="space-y-4" @submit.prevent="submitRole">
          <div>
            <label class="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Role name
            </label>
            <input
              v-model="roleForm.name"
              type="text"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              placeholder="e.g. Super Admin"
            >
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Description
            </label>
            <textarea
              v-model="roleForm.description"
              rows="4"
              class="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              placeholder="What this role can do..."
            />
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Status
            </label>
            <select
              v-model="roleForm.status"
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div class="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              class="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              @click="roleModalOpen = false"
              :disabled="roleModalLoading"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="roleModalLoading"
            >
              {{ roleModalLoading ? 'Saving…' : roleModalMode === 'create' ? 'Create Role' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </AppModal>
  </div>
</template>

