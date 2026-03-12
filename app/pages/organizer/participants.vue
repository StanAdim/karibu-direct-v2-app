<script setup lang="ts">
import type { Participant, ParticipantStatus } from '~/types'
import { getParticipantFullName, getStatusColor, getStatusLabel } from '~/types'

definePageMeta({
  layout: 'organizer',
  middleware: 'organizer'
})

const route = useRoute()
const notifications = useNotifications()

const eventId = computed(() => route.query.eventId as string | undefined)
const searchQuery = ref('')
const selectedStatus = ref<ParticipantStatus | ''>('')
const loading = ref(false)

const participants = ref<Participant[]>([
  {
    id: '1',
    eventId: 'event-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    ticket: {
      id: 't1',
      ticketType: { id: 'tt1', name: 'VIP', description: '', price: 199, currency: 'USD', quantity: 100, soldCount: 50, maxPerOrder: 2, salesStart: '', salesEnd: '', status: 'available' },
      ticketNumber: 'TKT-001',
      qrCode: 'qr-001',
      price: 199,
      currency: 'USD',
      paymentStatus: 'completed',
      purchasedAt: new Date().toISOString()
    },
    status: 'checked_in',
    registeredAt: new Date(Date.now() - 86400000).toISOString(),
    checkedInAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    eventId: 'event-1',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    ticket: {
      id: 't2',
      ticketType: { id: 'tt2', name: 'General', description: '', price: 99, currency: 'USD', quantity: 500, soldCount: 200, maxPerOrder: 5, salesStart: '', salesEnd: '', status: 'available' },
      ticketNumber: 'TKT-002',
      qrCode: 'qr-002',
      price: 99,
      currency: 'USD',
      paymentStatus: 'completed',
      purchasedAt: new Date().toISOString()
    },
    status: 'confirmed',
    registeredAt: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    eventId: 'event-1',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob@example.com',
    ticket: {
      id: 't3',
      ticketType: { id: 'tt2', name: 'General', description: '', price: 99, currency: 'USD', quantity: 500, soldCount: 200, maxPerOrder: 5, salesStart: '', salesEnd: '', status: 'available' },
      ticketNumber: 'TKT-003',
      qrCode: 'qr-003',
      price: 99,
      currency: 'USD',
      paymentStatus: 'completed',
      purchasedAt: new Date().toISOString()
    },
    status: 'registered',
    registeredAt: new Date(Date.now() - 259200000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
])

const statusOptions = [
  { value: '', label: 'All Status' },
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

    const matchesStatus = !selectedStatus.value || p.status === selectedStatus.value

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
  participant.checkedInAt = new Date().toISOString()
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
        <UButton
          variant="outline"
          icon="i-lucide-download"
        >
          Export
        </UButton>
        <UButton
          icon="i-lucide-plus"
        >
          Add Participant
        </UButton>
      </template>
    </PageHeader>

    <!-- Stats -->
    <div class="mb-6 grid gap-4 sm:grid-cols-3">
      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-950">
            <UIcon
              name="i-lucide-users"
              class="h-6 w-6 text-primary-600"
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
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
            <UIcon
              name="i-lucide-user-check"
              class="h-6 w-6 text-emerald-600"
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
      </UCard>

      <UCard>
        <div class="flex items-center gap-4">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
            <UIcon
              name="i-lucide-clock"
              class="h-6 w-6 text-amber-600"
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
      </UCard>
    </div>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-64">
          <UInput
            v-model="searchQuery"
            placeholder="Search by name or email..."
            icon="i-lucide-search"
          />
        </div>

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
                <UAvatar
                  :alt="getParticipantFullName(participant)"
                  size="sm"
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
                  {{ participant.ticket.ticketType.name }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ participant.ticket.ticketNumber }}
                </div>
              </div>
            </td>

            <td class="px-4 py-4">
              <UBadge
                :color="getStatusColor(participant.status) as 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'primary'"
                variant="soft"
              >
                {{ getStatusLabel(participant.status) }}
              </UBadge>
            </td>

            <td class="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
              {{ formatDate(participant.registeredAt) }}
            </td>

            <td class="px-4 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <UButton
                  v-if="participant.status !== 'checked_in' && participant.status !== 'cancelled'"
                  size="sm"
                  icon="i-lucide-check"
                  @click="checkInParticipant(participant)"
                >
                  Check In
                </UButton>

                <UDropdownMenu
                  :items="[
                    [
                      { label: 'View Details', icon: 'i-lucide-eye' },
                      { label: 'Edit', icon: 'i-lucide-pencil' }
                    ],
                    [
                      { label: 'Cancel Registration', icon: 'i-lucide-x' }
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
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
