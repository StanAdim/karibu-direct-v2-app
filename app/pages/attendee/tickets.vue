<script setup lang="ts">
import type { Ticket, TicketStatus } from '~/types'
import { getTicketStatusColor, getTicketStatusLabel, isTicketValid } from '~/types'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee'
})

const searchQuery = ref('')
const activeTab = ref<'active' | 'past'>('active')
const selectedTicket = ref<Ticket | null>(null)
const qrModalOpen = ref(false)

const tickets = ref<Ticket[]>([
  {
    id: '1',
    ticket_number: 'TKT-2026-001',
    event_id: 'event-1',
    user_id: 'user-1',
    ticket_type_id: 'type-1',
    ticket_type_name: 'VIP Pass',
    qr_code: 'data:image/png;base64,QR_CODE_DATA',
    status: 'valid',
    price: 199,
    currency: 'USD',
    purchased_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    valid_from: new Date(Date.now() - 86400000).toISOString(),
    valid_until: new Date(Date.now() + 86400000 * 30).toISOString(),
    event: {
      id: 'event-1',
      title: 'Global Tech Conference 2024',
      slug: 'global-tech-conference-2024',
      description: 'Annual technology conference',
      cover_image: 'https://picsum.photos/seed/tech-conf/400/240',
      start_date: new Date(Date.now() + 86400000 * 10).toISOString(),
      end_date: new Date(Date.now() + 86400000 * 11).toISOString(),
      timezone: 'America/New_York',
      venue: { type: 'physical', name: 'Moscone Center', city: 'San Francisco', address: 'San Francisco, CA' },
      status: 'published',
      visibility: 'public',
      capacity: 1000,
      registered_count: 850,
      organizer_id: 'org-1',
      categories: ['Technology'],
      tags: [],
      ticket_types: [],
      settings: { require_approval: false, allow_waitlist: true, show_attendee_count: true, enable_check_in: true, enable_notifications: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    ticket_number: 'TKT-2026-002',
    event_id: 'event-2',
    user_id: 'user-1',
    ticket_type_id: 'type-2',
    ticket_type_name: 'General Admission',
    qr_code: 'data:image/png;base64,QR_CODE_DATA',
    status: 'valid',
    price: 49,
    currency: 'USD',
    purchased_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    valid_from: new Date(Date.now() - 86400000).toISOString(),
    valid_until: new Date(Date.now() + 86400000 * 15).toISOString(),
    event: {
      id: 'event-2',
      title: 'Midnight Jazz Festival',
      slug: 'midnight-jazz-festival',
      description: 'Live jazz performances',
      cover_image: 'https://picsum.photos/seed/jazz-fest/400/240',
      start_date: new Date(Date.now() + 86400000 * 20).toISOString(),
      end_date: new Date(Date.now() + 86400000 * 20).toISOString(),
      timezone: 'America/Los_Angeles',
      venue: { type: 'physical', name: 'Blue Note Lounge', city: 'Seattle', address: 'Seattle, WA' },
      status: 'published',
      visibility: 'public',
      capacity: 200,
      registered_count: 180,
      organizer_id: 'org-1',
      categories: ['Music'],
      tags: [],
      ticket_types: [],
      settings: { require_approval: false, allow_waitlist: false, show_attendee_count: true, enable_check_in: true, enable_notifications: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    ticket_number: 'TKT-2026-003',
    event_id: 'event-3',
    user_id: 'user-1',
    ticket_type_id: 'type-1',
    ticket_type_name: 'Standard',
    qr_code: 'data:image/png;base64,QR_CODE_DATA',
    status: 'used',
    price: 75,
    currency: 'USD',
    purchased_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    valid_from: new Date(Date.now() - 86400000 * 20).toISOString(),
    valid_until: new Date(Date.now() - 86400000 * 10).toISOString(),
    checked_in_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    event: {
      id: 'event-3',
      title: 'AI Summit 2026',
      slug: 'ai-summit-2026',
      description: 'AI and Machine Learning conference',
      cover_image: 'https://picsum.photos/seed/ai-summit/400/240',
      start_date: new Date(Date.now() - 86400000 * 15).toISOString(),
      end_date: new Date(Date.now() - 86400000 * 14).toISOString(),
      timezone: 'America/New_York',
      venue: { type: 'physical', name: 'Tech Hub', city: 'New York', address: 'New York, NY' },
      status: 'completed',
      visibility: 'public',
      capacity: 500,
      registered_count: 480,
      organizer_id: 'org-2',
      categories: ['Technology', 'AI'],
      tags: [],
      ticket_types: [],
      settings: { require_approval: false, allow_waitlist: true, show_attendee_count: true, enable_check_in: true, enable_notifications: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
])

const filteredTickets = computed(() => {
  let list = tickets.value
  if (activeTab.value === 'active') {
    list = list.filter(t => t.status === 'valid' && new Date(t.valid_until) >= new Date())
  } else {
    list = list.filter(t => t.status === 'used' || t.status === 'expired' || new Date(t.valid_until) < new Date())
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(t =>
      t.event?.title?.toLowerCase().includes(q) ||
      t.event?.venue?.name?.toLowerCase().includes(q) ||
      t.event?.venue?.city?.toLowerCase().includes(q)
    )
  }
  return list
})

function showQrCode(ticket: Ticket) {
  selectedTicket.value = ticket
  qrModalOpen.value = true
}

function formatDateWithTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) + ' • ' + new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function getEventImage(ticket: Ticket): string {
  return ticket.event?.cover_image || 'https://picsum.photos/seed/event/400/240'
}

function getVenueLine(ticket: Ticket): string {
  const v = ticket.event?.venue
  if (!v) return '—'
  if (v.type === 'virtual') return 'Online'
  return [v.name, v.city].filter(Boolean).join(', ')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        My Tickets
      </h1>
      <p class="mt-1 text-slate-600 dark:text-slate-400 text-sm">
        Manage and view your upcoming and past event registrations.
      </p>
    </div>

    <!-- Search -->
    <div class="relative">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Search by event name or location"
        class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
      />
    </div>

    <!-- Tabs: Active | Past -->
    <div class="flex border-b border-slate-200 dark:border-slate-800">
      <button
        type="button"
        :class="[
          'pb-3 px-1 text-sm font-medium border-b-2 transition-colors -mb-px',
          activeTab === 'active'
            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-400'
        ]"
        @click="activeTab = 'active'"
      >
        Active
      </button>
      <button
        type="button"
        :class="[
          'pb-3 px-1 ml-6 text-sm font-medium border-b-2 transition-colors -mb-px',
          activeTab === 'past'
            ? 'border-primary-500 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-400'
        ]"
        @click="activeTab = 'past'"
      >
        Past
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-if="filteredTickets.length === 0"
      class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 px-6 py-16 text-center"
    >
      <span class="material-symbols-outlined text-5xl text-slate-400 mb-4">confirmation_number</span>
      <h3 class="text-lg font-semibold text-slate-900 dark:text-white">No tickets found</h3>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-sm">Browse events to get your first ticket.</p>
      <NuxtLink
        to="/attendee/events"
        class="mt-6 inline-flex items-center rounded-xl bg-primary-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-primary-600"
      >
        Browse Events
      </NuxtLink>
    </div>

    <!-- Ticket cards: image left, details right, View Ticket button -->
    <div v-else class="space-y-4">
      <article
        v-for="ticket in filteredTickets"
        :key="ticket.id"
        class="flex flex-col sm:flex-row rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
      >
        <div class="relative w-full sm:w-48 shrink-0 aspect-[2/1] sm:aspect-auto sm:h-auto sm:min-h-[180px] overflow-hidden">
          <img
            :src="getEventImage(ticket)"
            :alt="ticket.event?.title"
            class="h-full w-full object-cover"
          >
          <span
            class="absolute left-3 top-3 rounded px-2 py-0.5 text-xs font-bold text-white bg-primary-600"
          >
            {{ activeTab === 'active' ? 'UPCOMING' : 'PAST' }}
          </span>
        </div>
        <div class="flex flex-1 flex-col p-4 sm:p-5 min-w-0">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white truncate">
            {{ ticket.event?.title }}
          </h3>
          <p class="mt-1 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
            <span class="material-symbols-outlined text-lg">calendar_today</span>
            {{ formatDateWithTime(ticket.event?.start_date || '') }}
          </p>
          <p class="mt-1 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
            <span class="material-symbols-outlined text-lg">location_on</span>
            {{ getVenueLine(ticket) }}
          </p>
          <div class="mt-3 flex items-center gap-2">
            <div class="flex -space-x-2">
              <div class="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/50 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-medium text-primary-600 dark:text-primary-400">A</div>
              <div class="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/50 border-2 border-white dark:border-slate-900 flex items-center justify-center text-xs font-medium text-primary-600 dark:text-primary-400">J</div>
            </div>
            <span class="text-xs text-slate-500">+2</span>
          </div>
          <div class="mt-auto pt-4 flex justify-end sm:justify-end">
            <UButton
              v-if="isTicketValid(ticket)"
              color="primary"
              icon="i-lucide-qr-code"
              @click="showQrCode(ticket)"
            >
              View Ticket
            </UButton>
            <NuxtLink v-else :to="`/attendee/events/${ticket.event_id}`">
              <UButton variant="soft">
                View Event
              </UButton>
            </NuxtLink>
          </div>
        </div>
      </article>
    </div>

    <!-- Promo code section -->
    <div class="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 p-8 text-center">
      <span class="material-symbols-outlined text-4xl text-primary-500">add_circle</span>
      <h3 class="mt-3 text-base font-semibold text-slate-900 dark:text-white">
        Have a promo code?
      </h3>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Add a new ticket to your account by entering your registration code.
      </p>
      <NuxtLink
        to="/attendee"
        class="mt-4 inline-block text-sm font-medium text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
      >
        Redeem Ticket Code
      </NuxtLink>
    </div>

    <!-- QR Code Modal -->
    <UModal v-model:open="qrModalOpen">
      <template #content>
        <div v-if="selectedTicket" class="p-6 text-center">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            {{ selectedTicket.event?.title }}
          </h3>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {{ selectedTicket.ticket_type_name }}
          </p>
          <div class="mx-auto mt-6 flex h-48 w-48 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
            <UIcon name="i-lucide-qr-code" class="h-32 w-32 text-slate-400" />
          </div>
          <p class="mt-4 font-mono text-sm text-slate-600 dark:text-slate-400">
            {{ selectedTicket.ticket_number }}
          </p>
          <p class="mt-2 text-xs text-slate-500">Present this QR code at the event entrance</p>
          <UButton class="mt-6" block @click="qrModalOpen = false">
            Close
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
