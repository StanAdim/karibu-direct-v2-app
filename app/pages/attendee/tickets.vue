<script setup lang="ts">
import type { Ticket, TicketStatus } from '~/types'
import { getTicketStatusColor, getTicketStatusLabel, isTicketValid } from '~/types'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee'
})

const selectedStatus = ref<TicketStatus | ''>('')
const selectedTicket = ref<Ticket | null>(null)
const qrModalOpen = ref(false)

const statusOptions = [
  { value: '', label: 'All Tickets' },
  { value: 'valid', label: 'Valid' },
  { value: 'used', label: 'Used' },
  { value: 'expired', label: 'Expired' }
]

const tickets = ref<Ticket[]>([
  {
    id: '1',
    ticketNumber: 'TKT-2026-001',
    eventId: 'event-1',
    userId: 'user-1',
    ticketTypeId: 'type-1',
    ticketTypeName: 'VIP Pass',
    qrCode: 'data:image/png;base64,QR_CODE_DATA',
    status: 'valid',
    price: 199,
    currency: 'USD',
    purchasedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    validFrom: new Date(Date.now() - 86400000).toISOString(),
    validUntil: new Date(Date.now() + 86400000 * 30).toISOString(),
    event: {
      id: 'event-1',
      title: 'Tech Conference 2026',
      slug: 'tech-conference-2026',
      description: 'Annual technology conference',
      startDate: new Date(Date.now() + 86400000 * 10).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 11).toISOString(),
      timezone: 'America/New_York',
      venue: { type: 'physical', name: 'Convention Center', city: 'San Francisco' },
      status: 'published',
      visibility: 'public',
      capacity: 1000,
      registeredCount: 850,
      organizerId: 'org-1',
      categories: ['Technology'],
      tags: [],
      ticketTypes: [],
      settings: { requireApproval: false, allowWaitlist: true, showAttendeeCount: true, enableCheckIn: true, enableNotifications: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    ticketNumber: 'TKT-2026-002',
    eventId: 'event-2',
    userId: 'user-1',
    ticketTypeId: 'type-2',
    ticketTypeName: 'General Admission',
    qrCode: 'data:image/png;base64,QR_CODE_DATA',
    status: 'valid',
    price: 49,
    currency: 'USD',
    purchasedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    validFrom: new Date(Date.now() - 86400000).toISOString(),
    validUntil: new Date(Date.now() + 86400000 * 15).toISOString(),
    event: {
      id: 'event-2',
      title: 'Developer Workshop',
      slug: 'developer-workshop',
      description: 'Hands-on coding workshop',
      startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      timezone: 'America/New_York',
      venue: { type: 'virtual', virtualUrl: 'https://zoom.us' },
      status: 'published',
      visibility: 'public',
      capacity: 50,
      registeredCount: 45,
      organizerId: 'org-1',
      categories: ['Technology', 'Education'],
      tags: [],
      ticketTypes: [],
      settings: { requireApproval: false, allowWaitlist: false, showAttendeeCount: true, enableCheckIn: true, enableNotifications: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    ticketNumber: 'TKT-2026-003',
    eventId: 'event-3',
    userId: 'user-1',
    ticketTypeId: 'type-1',
    ticketTypeName: 'Standard',
    qrCode: 'data:image/png;base64,QR_CODE_DATA',
    status: 'used',
    price: 75,
    currency: 'USD',
    purchasedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    validFrom: new Date(Date.now() - 86400000 * 20).toISOString(),
    validUntil: new Date(Date.now() - 86400000 * 10).toISOString(),
    checkedInAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    event: {
      id: 'event-3',
      title: 'AI Summit 2026',
      slug: 'ai-summit-2026',
      description: 'AI and Machine Learning conference',
      startDate: new Date(Date.now() - 86400000 * 15).toISOString(),
      endDate: new Date(Date.now() - 86400000 * 14).toISOString(),
      timezone: 'America/New_York',
      venue: { type: 'physical', name: 'Tech Hub', city: 'New York' },
      status: 'completed',
      visibility: 'public',
      capacity: 500,
      registeredCount: 480,
      organizerId: 'org-2',
      categories: ['Technology', 'AI'],
      tags: [],
      ticketTypes: [],
      settings: { requireApproval: false, allowWaitlist: true, showAttendeeCount: true, enableCheckIn: true, enableNotifications: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
])

const filteredTickets = computed(() => {
  if (!selectedStatus.value) return tickets.value
  return tickets.value.filter(t => t.status === selectedStatus.value)
})

function showQrCode(ticket: Ticket) {
  selectedTicket.value = ticket
  qrModalOpen.value = true
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<template>
  <div>
    <PageHeader
      title="My Tickets"
      description="View and manage your event tickets"
    />

    <!-- Filters -->
    <div class="mb-6 flex items-center gap-4">
      <USelect
        v-model="selectedStatus"
        :items="statusOptions"
        value-key="value"
        label-key="label"
        class="w-44"
      />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-if="filteredTickets.length === 0"
      icon="i-lucide-ticket"
      title="No tickets found"
      description="Browse events to get your first ticket"
    >
      <template #actions>
        <UButton
          icon="i-lucide-search"
          to="/attendee/events"
        >
          Browse Events
        </UButton>
      </template>
    </EmptyState>

    <!-- Tickets Grid -->
    <div
      v-else
      class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <UCard
        v-for="ticket in filteredTickets"
        :key="ticket.id"
        :class="{ 'opacity-60': ticket.status !== 'valid' }"
      >
        <!-- Event Info -->
        <div class="flex items-start gap-4">
          <div
            class="flex h-16 w-16 flex-col items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-950"
          >
            <span class="text-xs font-medium uppercase">
              {{ new Date(ticket.event?.startDate || '').toLocaleDateString('en-US', { month: 'short' }) }}
            </span>
            <span class="text-xl font-bold">
              {{ new Date(ticket.event?.startDate || '').getDate() }}
            </span>
          </div>

          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 dark:text-white truncate">
              {{ ticket.event?.title }}
            </h3>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {{ ticket.ticketTypeName }}
            </p>
            <UBadge
              :color="getTicketStatusColor(ticket.status) as 'success' | 'error' | 'warning' | 'info' | 'neutral'"
              variant="soft"
              size="xs"
              class="mt-2"
            >
              {{ getTicketStatusLabel(ticket.status) }}
            </UBadge>
          </div>
        </div>

        <!-- Ticket Details -->
        <div class="mt-4 space-y-2 border-t border-dashed border-gray-200 pt-4 dark:border-gray-800">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Ticket #</span>
            <span class="font-mono font-medium text-gray-900 dark:text-white">
              {{ ticket.ticketNumber }}
            </span>
          </div>

          <div
            v-if="ticket.event?.venue"
            class="flex items-center justify-between text-sm"
          >
            <span class="text-gray-600 dark:text-gray-400">Venue</span>
            <span class="text-gray-900 dark:text-white">
              {{ ticket.event.venue.type === 'virtual' ? 'Online' : ticket.event.venue.city }}
            </span>
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Price</span>
            <span class="font-medium text-gray-900 dark:text-white">
              ${{ ticket.price }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-4 flex gap-2">
          <UButton
            v-if="isTicketValid(ticket)"
            block
            icon="i-lucide-qr-code"
            @click="showQrCode(ticket)"
          >
            Show QR Code
          </UButton>
          <UButton
            v-else
            block
            variant="soft"
            :to="`/attendee/events/${ticket.eventId}`"
          >
            View Event
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- QR Code Modal -->
    <UModal v-model:open="qrModalOpen">
      <template #content>
        <div
          v-if="selectedTicket"
          class="p-6 text-center"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ selectedTicket.event?.title }}
          </h3>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {{ selectedTicket.ticketTypeName }}
          </p>

          <!-- QR Code Placeholder -->
          <div class="mx-auto mt-6 flex h-48 w-48 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
            <UIcon
              name="i-lucide-qr-code"
              class="h-32 w-32 text-gray-400"
            />
          </div>

          <p class="mt-4 font-mono text-sm text-gray-600 dark:text-gray-400">
            {{ selectedTicket.ticketNumber }}
          </p>

          <p class="mt-2 text-xs text-gray-500">
            Present this QR code at the event entrance
          </p>

          <UButton
            class="mt-6"
            block
            @click="qrModalOpen = false"
          >
            Close
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
