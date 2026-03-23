<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Participant, ParticipantStatus } from '~/types'
import { getParticipantFullName } from '~/types'
import AppButton from '~/components/ui/AppButton.vue'
import AppAvatar from '~/components/common/AppAvatar.vue'
import AppSearchInput from '~/components/common/AppSearchInput.vue'
import AppLucideIcon from '~/components/common/AppLucideIcon.vue'
import StatusBadge from '~/components/common/StatusBadge.vue'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const notifications = useNotifications()

const searchQuery = ref('')
const selectedStatus = ref<ParticipantStatus | 'all'>('all')
const loading = ref(false)
const openMenuParticipantId = ref<string | null>(null)

function closeMenus() {
  openMenuParticipantId.value = null
}

function onDocumentClick(e: MouseEvent) {
  const el = e.target as HTMLElement
  if (!el.closest('[data-participant-menu-root]')) {
    closeMenus()
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))

const participants = ref<Participant[]>([
  {
    id: '1',
    event_id: 'event-1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    ticket: {
      id: 't1',
      ticket_type: { id: 'tt1', name: 'VIP', description: '', price: 199, currency: 'USD', quantity: 100, sold_count: 50, max_per_order: 2, sales_start: '', sales_end: '', status: 'available' },
      ticket_number: 'TKT-001',
      qr_code: 'qr-001',
      price: 199,
      currency: 'USD',
      payment_status: 'completed',
      purchased_at: new Date().toISOString()
    },
    status: 'checked_in',
    registered_at: new Date(Date.now() - 86400000).toISOString(),
    checked_in_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    event_id: 'event-1',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane@example.com',
    ticket: {
      id: 't2',
      ticket_type: { id: 'tt2', name: 'General', description: '', price: 99, currency: 'USD', quantity: 500, sold_count: 200, max_per_order: 5, sales_start: '', sales_end: '', status: 'available' },
      ticket_number: 'TKT-002',
      qr_code: 'qr-002',
      price: 99,
      currency: 'USD',
      payment_status: 'completed',
      purchased_at: new Date().toISOString()
    },
    status: 'confirmed',
    registered_at: new Date(Date.now() - 172800000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    event_id: 'event-1',
    first_name: 'Bob',
    last_name: 'Johnson',
    email: 'bob@example.com',
    ticket: {
      id: 't3',
      ticket_type: { id: 'tt2', name: 'General', description: '', price: 99, currency: 'USD', quantity: 500, sold_count: 200, max_per_order: 5, sales_start: '', sales_end: '', status: 'available' },
      ticket_number: 'TKT-003',
      qr_code: 'qr-003',
      price: 99,
      currency: 'USD',
      payment_status: 'completed',
      purchased_at: new Date().toISOString()
    },
    status: 'registered',
    registered_at: new Date(Date.now() - 259200000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
])

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'registered', label: 'Registered' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' }
]

const filteredParticipants = computed(() => {
  return participants.value.filter((p) => {
    const matchesSearch = !searchQuery.value ||
      getParticipantFullName(p).toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus = selectedStatus.value === 'all' || p.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

const stats = computed(() => ({
  total: participants.value.length,
  checkedIn: participants.value.filter(p => p.status === 'checked_in').length,
  pending: participants.value.filter(p => p.status === 'registered' || p.status === 'confirmed').length
}))

async function checkInParticipant(participant: Participant) {
  participant.status = 'checked_in'
  participant.checked_in_at = new Date().toISOString()
  closeMenus()
  notifications.success(`${getParticipantFullName(participant)} checked in`)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div>
    <PageHeader
      title="Participants"
      description="Manage event participants and check-ins"
    >
      <template #actions>
        <AppButton
          color="neutral"
          icon="download"
        >
          Export
        </AppButton>
        <AppButton
          icon="person_add"
        >
          Add Participant
        </AppButton>
      </template>
    </PageHeader>

    <!-- Stats -->
    <div class="mb-6 grid gap-4 sm:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950">
            <AppLucideIcon
              name="i-lucide-users"
              :size="24"
              class="text-primary-600 dark:text-primary-400"
            />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats.total }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Total Participants
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
            <AppLucideIcon
              name="i-lucide-user-check"
              :size="24"
              class="text-emerald-600 dark:text-emerald-400"
            />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats.checkedIn }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Checked In
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
            <AppLucideIcon
              name="i-lucide-clock"
              :size="24"
              class="text-amber-600 dark:text-amber-400"
            />
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats.pending }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Pending
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="flex flex-wrap items-center gap-4">
        <div class="min-w-64 flex-1">
          <AppSearchInput
            v-model="searchQuery"
            placeholder="Search by name or email..."
          />
        </div>

        <div
          class="flex min-w-44 items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/50"
        >
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</span>
          <select
            v-model="selectedStatus"
            class="min-w-0 flex-1 cursor-pointer border-0 bg-transparent text-sm font-semibold text-slate-900 focus:ring-0 dark:text-white"
          >
            <option
              v-for="opt in statusOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Participants Table -->
    <div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Participant
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Ticket
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Status
            </th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Registered
            </th>
            <th class="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
              Actions
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-950">
          <tr v-if="loading">
            <td
              colspan="5"
              class="px-4 py-8 text-center"
            >
              <LoadingState text="Loading participants..." />
            </td>
          </tr>

          <tr v-else-if="filteredParticipants.length === 0">
            <td
              colspan="5"
              class="px-4 py-8"
            >
              <EmptyState
                icon="i-lucide-users"
                title="No participants found"
                description="Try adjusting your search or filters"
              />
            </td>
          </tr>

          <tr
            v-for="participant in filteredParticipants"
            v-else
            :key="participant.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <td class="px-4 py-4">
              <div class="flex items-center gap-3">
                <AppAvatar
                  :alt="getParticipantFullName(participant)"
                  size="sm"
                  class="shrink-0"
                />
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ getParticipantFullName(participant) }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ participant.email }}
                  </div>
                </div>
              </div>
            </td>

            <td class="px-4 py-4">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ participant.ticket.ticket_type.name }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ participant.ticket.ticket_number }}
                </div>
              </div>
            </td>

            <td class="px-4 py-4">
              <StatusBadge
                :status="participant.status"
                variant="solid"
                size="sm"
              />
            </td>

            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
              {{ formatDate(participant.registered_at) }}
            </td>

            <td class="px-4 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <AppButton
                  v-if="participant.status !== 'checked_in' && participant.status !== 'cancelled'"
                  size="sm"
                  color="success"
                  icon="check"
                  class="!px-3 !py-1.5 !text-xs"
                  @click="checkInParticipant(participant)"
                >
                  Check In
                </AppButton>

                <div
                  data-participant-menu-root
                  class="relative inline-flex justify-end"
                >
                  <button
                    type="button"
                    class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    aria-label="Row actions"
                    @click.stop="openMenuParticipantId = openMenuParticipantId === participant.id ? null : participant.id"
                  >
                    <AppLucideIcon
                      name="i-lucide-more-horizontal"
                      :size="20"
                    />
                  </button>
                  <div
                    v-if="openMenuParticipantId === participant.id"
                    class="absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
                    role="menu"
                    @click.stop
                  >
                    <button
                      type="button"
                      role="menuitem"
                      class="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      @click="closeMenus()"
                    >
                      <AppLucideIcon
                        name="i-lucide-eye"
                        :size="16"
                      />
                      View Details
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      class="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      @click="closeMenus()"
                    >
                      <AppLucideIcon
                        name="i-lucide-pencil"
                        :size="16"
                      />
                      Edit
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      class="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                      @click="closeMenus()"
                    >
                      <AppLucideIcon
                        name="i-lucide-x"
                        :size="16"
                      />
                      Cancel Registration
                    </button>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
