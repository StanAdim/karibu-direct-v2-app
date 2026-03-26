<script setup lang="ts">
import QRCode from 'qrcode'
import type { Ticket } from '~/types'
import { isTicketValid } from '~/types'
import AppModal from '~/components/common/AppModal.vue'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee'
})

const searchQuery = ref('')
const activeTab = ref<'active' | 'past'>('active')
const selectedTicket = ref<Ticket | null>(null)
const qrModalOpen = ref(false)
const qrCodeDataUrl = ref<string | null>(null)
const qrCodeLoading = ref(false)

const registrationStore = useRegistrationStore()
const notifications = useNotifications()
const config = useRuntimeConfig()

const tickets = computed(() => registrationStore.userTickets)
const loadingTickets = computed(() => registrationStore.loadingUserRegistrations)

async function loadTickets() {
  try {
    await registrationStore.fetchUserRegistrations()
  }
  catch {
    notifications.error(registrationStore.error?.message || 'Failed to load your tickets')
  }
}

const filteredTickets = computed(() => {
  let list = tickets.value
  if (activeTab.value === 'active') {
    list = list.filter(t => t.status === 'valid' && new Date(t.valid_until) >= new Date())
  }
  else {
    list = list.filter(t => t.status === 'used' || t.status === 'expired' || new Date(t.valid_until) < new Date())
  }

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(t =>
      t.event?.title?.toLowerCase().includes(q)
      || t.event?.venue?.name?.toLowerCase().includes(q)
      || t.event?.venue?.city?.toLowerCase().includes(q)
      || t.ticket_number.toLowerCase().includes(q)
      || t.ticket_type_name.toLowerCase().includes(q)
      || t.user?.email?.toLowerCase().includes(q)
    )
  }
  return list
})

const activeCount = computed(() =>
  tickets.value.filter(t => t.status === 'valid' && new Date(t.valid_until) >= new Date()).length
)
const pastCount = computed(() =>
  tickets.value.filter(t => t.status === 'used' || t.status === 'expired' || new Date(t.valid_until) < new Date()).length
)

function ticketStatusBadge(ticket: Ticket): { label: string; cls: string } {
  if (ticket.status === 'used') return { label: 'Checked in', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' }
  if (ticket.status === 'expired') return { label: 'Expired', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' }
  if (ticket.status === 'cancelled') return { label: 'Cancelled', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' }
  return { label: 'Confirmed', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' }
}

function fullName(ticket: Ticket): string {
  const first = ticket.user?.first_name || ''
  const last = ticket.user?.last_name || ''
  const merged = `${first} ${last}`.trim()
  return merged || 'Ticket holder'
}

async function showQrCode(ticket: Ticket) {
  selectedTicket.value = ticket
  qrCodeDataUrl.value = null
  qrCodeLoading.value = true
  qrModalOpen.value = true
  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(ticket.qr_code || ticket.ticket_number, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 480
    })
  }
  catch {
    qrCodeDataUrl.value = null
    notifications.error('Could not render QR code')
  }
  finally {
    qrCodeLoading.value = false
  }
}

function formatDateWithTime(dateString: string): string {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) + ' • ' + new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function getEventImage(ticket: Ticket): string {
  const base = String(config.public.apiBase ?? '')
  const raw = ticket.event?.cover_image || ''
  if (!raw) return `https://picsum.photos/seed/event-${ticket.event_id}/400/240`
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw
  return `${base}${raw.startsWith('/') ? '' : '/'}${raw}`
}

function getVenueLine(ticket: Ticket): string {
  const v = ticket.event?.venue
  if (!v) return '—'
  if (v.type === 'virtual') return 'Online'
  return [v.name, v.city].filter(Boolean).join(', ')
}

function formatPrice(ticket: Ticket): string {
  if (ticket.price === 0) return 'Free'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: ticket.currency || 'TZS'
    }).format(ticket.price)
  }
  catch {
    return `${ticket.price.toLocaleString()} ${ticket.currency}`
  }
}

onMounted(() => {
  void loadTickets()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
        My Tickets
      </h1>
      <p class="mt-1 text-slate-600 dark:text-slate-400 text-sm">
        Manage and view your upcoming and past event registrations.
      </p>
    </div>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <p class="text-xs uppercase tracking-wide text-slate-500">
          Total tickets
        </p>
        <p class="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
          {{ tickets.length }}
        </p>
      </div>
      <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <p class="text-xs uppercase tracking-wide text-slate-500">
          Active
        </p>
        <p class="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          {{ activeCount }}
        </p>
      </div>
      <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <p class="text-xs uppercase tracking-wide text-slate-500">
          Past
        </p>
        <p class="mt-1 text-2xl font-bold text-slate-700 dark:text-slate-300">
          {{ pastCount }}
        </p>
      </div>
    </div>

    <div class="relative">
      <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Search by event name or location"
        class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
      />
    </div>

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

    <div v-if="loadingTickets" class="py-10 flex justify-center">
      <LoadingState text="Loading your tickets..." />
    </div>

    <div
      v-else-if="filteredTickets.length === 0"
      class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 px-6 py-16 text-center"
    >
      <span class="material-symbols-outlined text-5xl text-slate-400 mb-4">confirmation_number</span>
      <h3 class="text-lg font-semibold text-slate-900 dark:text-white">No tickets found</h3>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-sm">Browse events to get your first ticket.</p>
      <AppButton
        to="/attendee/events"
        class="mt-6"
      >
        Browse Events
      </AppButton>
    </div>

    <div v-else class="space-y-4">
      <article
        v-for="ticket in filteredTickets"
        :key="ticket.id"
        class="flex flex-col sm:flex-row rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
      >
        <div class="relative w-full sm:w-56 shrink-0 aspect-2/1 sm:aspect-auto sm:h-auto sm:min-h-[220px] overflow-hidden">
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
        <div class="flex flex-1 flex-col p-4 sm:p-5 min-w-0 gap-4">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white truncate">
                {{ ticket.event?.title || 'Event' }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono truncate">
                {{ ticket.ticket_number }}
              </p>
            </div>
            <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold" :class="ticketStatusBadge(ticket).cls">
              {{ ticketStatusBadge(ticket).label }}
            </span>
          </div>

          <div class="grid gap-2 sm:grid-cols-2 text-sm">
            <p class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span class="material-symbols-outlined text-lg">calendar_today</span>
              {{ formatDateWithTime(ticket.event?.start_date || ticket.valid_from) }}
            </p>
            <p class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span class="material-symbols-outlined text-lg">location_on</span>
              {{ getVenueLine(ticket) }}
            </p>
            <p class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span class="material-symbols-outlined text-lg">confirmation_number</span>
              {{ ticket.ticket_type_name }}
            </p>
            <p class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span class="material-symbols-outlined text-lg">payments</span>
              {{ formatPrice(ticket) }}
            </p>
            <p class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 sm:col-span-2">
              <span class="material-symbols-outlined text-lg">person</span>
              {{ fullName(ticket) }} <span v-if="ticket.user?.email" class="text-slate-400">• {{ ticket.user.email }}</span>
            </p>
            <p class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 sm:col-span-2">
              <span class="material-symbols-outlined text-lg">schedule</span>
              Valid until {{ formatDateWithTime(ticket.valid_until) }}
            </p>
          </div>

          <div class="mt-auto pt-2 flex justify-end gap-2">
            <UButton
              v-if="ticket.qr_code"
              color="primary"
              icon="i-lucide-qr-code"
              @click="showQrCode(ticket)"
            >
              View QR Code
            </UButton>
            <NuxtLink :to="`/attendee/events/${ticket.event_id}`">
              <UButton variant="soft">
                View Event
              </UButton>
            </NuxtLink>
            <UButton
              v-if="isTicketValid(ticket)"
              variant="outline"
              icon="i-lucide-ticket"
              @click="showQrCode(ticket)"
            >
              Check-in Pass
            </UButton>
          </div>
        </div>
      </article>
    </div>

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

    <AppModal v-model="qrModalOpen" max-width="md">
      <div v-if="selectedTicket" class="p-2 sm:p-4 text-center">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            {{ selectedTicket.event?.title }}
          </h3>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {{ selectedTicket.ticket_type_name }}
          </p>

          <div class="mx-auto mt-6 w-full max-w-[320px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <div v-if="qrCodeLoading" class="h-64 flex items-center justify-center">
              <LoadingState text="Generating QR..." />
            </div>
            <div v-else-if="qrCodeDataUrl" class="space-y-3">
              <img :src="qrCodeDataUrl" alt="Ticket QR code" class="mx-auto h-60 w-60 rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-2" >
              <!-- <p class="text-[11px] text-slate-500 break-all text-left">
                Encoded token: {{ selectedTicket.qr_code }}
              </p> -->
            </div>
            <div v-else class="h-64 flex flex-col items-center justify-center text-slate-500">
              <UIcon name="i-lucide-qr-code" class="h-12 w-12" />
              <p class="mt-2 text-sm">
                QR code unavailable for this ticket
              </p>
            </div>
          </div>

          <p class="mt-4 font-mono text-sm text-slate-600 dark:text-slate-400">
            {{ selectedTicket.ticket_number }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            {{ fullName(selectedTicket) }} • {{ selectedTicket.user?.email || 'No email' }}
          </p>
          <p class="mt-2 text-xs text-slate-500">
            Present this QR code at the event entrance for fast check-in.
          </p>
          <UButton class="mt-6" block @click="qrModalOpen = false">
            Close
          </UButton>
      </div>
    </AppModal>
  </div>
</template>
