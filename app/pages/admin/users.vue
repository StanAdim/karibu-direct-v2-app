<script setup lang="ts">
import type { User, UserRole, UserStatus } from '~/types'
import { getFullName } from '~/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const usersStore = useUsersStore()
const { confirm, isOpen, options, handleConfirm, handleCancel } = useConfirmDialog()
const notifications = useNotifications()

const searchQuery = ref('')
const selectedRole = ref<UserRole | ''>('')
const selectedStatus = ref<UserStatus | ''>('')
const deleteLoading = ref(false)
const userToDelete = ref<User | null>(null)

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'organizer', label: 'Organizer' },
  { value: 'attendee', label: 'Attendee' }
]

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' }
]

const columns = [
  { key: 'user', label: 'User' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Joined' },
  { key: 'actions', label: '' }
]

async function loadUsers() {
  await usersStore.fetchUsers({
    role: selectedRole.value || undefined,
    status: selectedStatus.value || undefined,
    search: searchQuery.value || undefined
  })
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
      notifications.success('User deleted successfully')
    }
    catch {
      notifications.error('Failed to delete user')
    }
    finally {
      deleteLoading.value = false
      userToDelete.value = null
    }
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

watch([searchQuery, selectedRole, selectedStatus], loadUsers)

onMounted(loadUsers)
</script>

<template>
  <div>
    <PageHeader
      title="Users"
      description="Manage platform users and their permissions"
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          to="/admin/users/create"
        >
          Add User
        </UButton>
      </template>
    </PageHeader>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-64">
          <UInput
            v-model="searchQuery"
            placeholder="Search users..."
            icon="i-lucide-search"
          />
        </div>

        <USelect
          v-model="selectedRole"
          :items="roleOptions"
          value-key="value"
          label-key="label"
          placeholder="Filter by role"
          class="w-40"
        />

        <USelect
          v-model="selectedStatus"
          :items="statusOptions"
          value-key="value"
          label-key="label"
          placeholder="Filter by status"
          class="w-40"
        />
      </div>
    </UCard>

    <!-- Users Table -->
    <div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
          <tr v-if="usersStore.loading">
            <td
              :colspan="columns.length"
              class="px-4 py-8 text-center"
            >
              <LoadingState text="Loading users..." />
            </td>
          </tr>

          <tr v-else-if="usersStore.users.length === 0">
            <td
              :colspan="columns.length"
              class="px-4 py-8"
            >
              <EmptyState
                icon="i-lucide-users"
                title="No users found"
                description="Try adjusting your search or filters"
              />
            </td>
          </tr>

          <tr
            v-for="user in usersStore.users"
            v-else
            :key="user.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <!-- User -->
            <td class="px-4 py-4">
              <div class="flex items-center gap-3">
                <UAvatar
                  :src="user.avatar"
                  :alt="getFullName(user)"
                  size="sm"
                />
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ getFullName(user) }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ user.email }}
                  </div>
                </div>
              </div>
            </td>

            <!-- Role -->
            <td class="px-4 py-4">
              <UBadge
                :color="user.role === 'admin' ? 'error' : user.role === 'organizer' ? 'warning' : 'info'"
                variant="soft"
              >
                {{ user.role }}
              </UBadge>
            </td>

            <!-- Status -->
            <td class="px-4 py-4">
              <StatusBadge :status="user.status" />
            </td>

            <!-- Joined -->
            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
              {{ formatDate(user.createdAt) }}
            </td>

            <!-- Actions -->
            <td class="px-4 py-4 text-right">
              <UDropdownMenu
                :items="[
                  [
                    { label: 'View', icon: 'i-lucide-eye', to: `/admin/users/${user.id}` },
                    { label: 'Edit', icon: 'i-lucide-pencil', to: `/admin/users/${user.id}/edit` }
                  ],
                  [
                    { label: 'Delete', icon: 'i-lucide-trash-2', click: () => handleDeleteUser(user) }
                  ]
                ]"
              >
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-more-horizontal"
                  size="sm"
                />
              </UDropdownMenu>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="usersStore.pagination.lastPage > 1"
      class="mt-6 flex items-center justify-between"
    >
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Showing {{ (usersStore.pagination.page - 1) * usersStore.pagination.perPage + 1 }} to
        {{ Math.min(usersStore.pagination.page * usersStore.pagination.perPage, usersStore.pagination.total) }}
        of {{ usersStore.pagination.total }} users
      </p>

      <UPagination
        :model-value="usersStore.pagination.page"
        :total="usersStore.pagination.total"
        :page-count="usersStore.pagination.perPage"
        @update:model-value="(page) => { usersStore.setPage(page); loadUsers() }"
      />
    </div>

    <!-- Delete Confirmation Modal -->
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
