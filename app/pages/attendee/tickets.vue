<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import QRCode from 'qrcode'
import type { Ticket } from '~/types'
import { isTicketValid } from '~/types'
import AppModal from '~/components/common/AppModal.vue'
import AppButton from '~/components/ui/AppButton.vue'
import { getEventCoverImageUrl } from '~/utils/eventImage'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee',
})

const searchQuery = ref('')
const searchDebounced = refDebounced(searchQuery, 320)

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

async function loadTickets(): Promise<void> {
  try {
    await registrationStore.fetchUserRegistrations()
  }
  catch {
    notifications.error(registrationStore.error?.message || 'Failed to load your tickets')
  }
}

function isActiveTicket(t: Ticket): boolean {
  return t.status === 'valid' && new Date(t.valid_until) >= new Date()
}

function isPastTicket(t: Ticket): boolean {
  return t.status === 'used'
    || t.status === 'expired'
    || t.status === 'cancelled'
    || new Date(t.valid_until) < new Date()
}

const filteredTickets = computed(() => {
  let list = tickets.value
  if (activeTab.value === 'active') {
    list = list.filter(isActiveTicket)
  }
  else {
    list = list.filter(isPastTicket)
  }

  const q = searchDebounced.value.trim().toLowerCase()
  if (q) {
    list = list.filter(t =>
      t.event?.title?.toLowerCase().includes(q)
      || t.event?.venue?.name?.toLowerCase().includes(q)
      || t.event?.venue?.city?.toLowerCase().includes(q)
      || t.ticket_number.toLowerCase().includes(q)
      || t.ticket_type_name.toLowerCase().includes(q)
      || t.user?.email?.toLowerCase().includes(q),
    )
  }
  return list
})

const activeCount = computed(() => tickets.value.filter(isActiveTicket).length)
const pastCount = computed(() => tickets.value.filter(isPastTicket).length)

function ticketStatusBadge(ticket: Ticket): { label: string; cls: string } {
  if (ticket.status === 'used') {
    return { label: 'Checked in', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' }
  }
  if (ticket.status === 'expired') {
    return { label: 'Expired', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200' }
  }
  if (ticket.status === 'cancelled') {
    return { label: 'Cancelled', cls: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200' }
  }
  if (!isActiveTicket(ticket)) {
    return { label: 'Inactive', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' }
  }
  return { label: 'Confirmed', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200' }
}

function fullName(ticket: Ticket): string {
  const first = ticket.user?.first_name || ''
  const last = ticket.user?.last_name || ''
  const merged = `${first} ${last}`.trim()
  return merged || 'Ticket holder'
}

async function showQrCode(ticket: Ticket): Promise<void> {
  selectedTicket.value = ticket
  qrCodeDataUrl.value = null
  qrCodeLoading.value = true
  qrModalOpen.value = true
  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(ticket.qr_code || ticket.ticket_number, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 480,
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
  const d = new Date(dateString)
  return `${d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} · ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
}

function getEventImage(ticket: Ticket): string {
  return getEventCoverImageUrl(
    ticket.event?.cover_image,
    String(config.public.apiBase ?? ''),
    `https://picsum.photos/seed/event-${ticket.event_id}/480/280`,
  )
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
      currency: ticket.currency || 'TZS',
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
  <div class="space-y-8 pb-10">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          My tickets
        </h1>
        <p class="mt-1 text-slate-600 dark:text-slate-400 text-sm max-w-xl">
          Active passes, check-in QR codes, and your event history — all in one place.
        </p>
      </div>
      <AppButton
        color="neutral"
        icon="i-lucide-refresh-cw"
        :disabled="loadingTickets"
        @click="loadTickets"
      >
        Refresh
      </AppButton>
    </div>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <p class="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Total
        </p>
        <p class="mt-1 text-2xl font-black tabular-nums text-slate-900 dark:text-white">
          {{ tickets.length }}
        </p>
      </div>
      <div class="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] dark:bg-emerald-950/20 p-4 shadow-sm">
        <p class="text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          Active
        </p>
        <p class="mt-1 text-2xl font-black tabular-nums text-emerald-700 dark:text-emerald-300">
          {{ activeCount }}
        </p>
      </div>
      <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <p class="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Past
        </p>
        <p class="mt-1 text-2xl font-black tabular-nums text-slate-800 dark:text-slate-200">
          {{ pastCount }}
        </p>
      </div>
    </div>

    <div class="sticky top-0 z-10 -mx-4 px-4 py-3 sm:mx-0 sm:px-0 sm:static sm:py-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md sm:bg-transparent sm:backdrop-blur-none border-b border-slate-200/80 dark:border-slate-800 sm:border-0 space-y-4">
      <div class="relative">
        <AppLucideIcon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search events, ticket type, number, city…"
          class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/25 focus:border-primary-500 outline-none transition-shadow"
        >
      </div>

      <div class="flex rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 p-1 gap-1">
        <button
          type="button"
          :class="[
            'flex-1 rounded-lg px-3 py-2 text-xs sm:text-sm font-bold transition-all',
            activeTab === 'active'
              ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
          ]"
          @click="activeTab = 'active'"
        >
          Active
          <span class="ml-1 tabular-nums opacity-80">({{ activeCount }})</span>
        </button>
        <button
          type="button"
          :class="[
            'flex-1 rounded-lg px-3 py-2 text-xs sm:text-sm font-bold transition-all',
            activeTab === 'past'
              ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
          ]"
          @click="activeTab = 'past'"
        >
          Past
          <span class="ml-1 tabular-nums opacity-80">({{ pastCount }})</span>
        </button>
      </div>
    </div>

    <div v-if="loadingTickets && tickets.length === 0" class="grid gap-4">
      <div v-for="n in 4" :key="n" class="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse flex flex-col sm:flex-row">
        <div class="h-44 sm:w-56 sm:h-auto shrink-0 bg-slate-200 dark:bg-slate-800" />
        <div class="flex-1 p-5 space-y-3">
          <div class="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
          <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
          <div class="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
        </div>
      </div>
    </div>

    <div
      v-else-if="filteredTickets.length === 0"
      class="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 px-6 py-16 text-center"
    >
      <AppLucideIcon name="confirmation_number" class="text-5xl text-slate-400 mx-auto mb-4" />
      <h3 class="text-lg font-bold text-slate-900 dark:text-white">
        {{ tickets.length === 0 ? 'No tickets yet' : 'No matches' }}
      </h3>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
        {{
          tickets.length === 0
            ? 'Discover events and book — your passes will show up here instantly.'
            : 'Try another search term or switch between Active and Past.'
        }}
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <AppButton to="/attendee/events" icon="explore" color="primary">
          Browse events
        </AppButton>
        <AppButton
          v-if="searchDebounced.trim()"
          color="neutral"
          @click="searchQuery = ''"
        >
          Clear search
        </AppButton>
      </div>
    </div>

    <div v-else class="space-y-4">
      <article
        v-for="ticket in filteredTickets"
        :key="ticket.id"
        class="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden hover:shadow-lg hover:border-primary-500/25 transition-all duration-300 flex flex-col lg:flex-row"
      >
        <div class="relative w-full lg:w-64 shrink-0 aspect-[16/10] lg:aspect-auto lg:min-h-[220px] overflow-hidden">
          <img
            :src="getEventImage(ticket)"
            :alt="ticket.event?.title || 'Event'"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-950/20 pointer-events-none" />
          <span
            class="absolute left-3 top-3 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white bg-slate-950/75 backdrop-blur-sm border border-white/10"
          >
            {{ activeTab === 'active' ? 'Active' : 'Past' }}
          </span>
        </div>

        <div class="flex flex-1 flex-col p-4 sm:p-5 min-w-0 gap-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <NuxtLink
                :to="`/attendee/events/${ticket.event_id}`"
                class="text-lg font-bold text-slate-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {{ ticket.event?.title || 'Event' }}
              </NuxtLink>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono truncate">
                {{ ticket.ticket_number }}
              </p>
            </div>
            <span class="inline-flex items-center self-start rounded-full px-3 py-1 text-xs font-bold shrink-0" :class="ticketStatusBadge(ticket).cls">
              {{ ticketStatusBadge(ticket).label }}
            </span>
          </div>

          <div class="grid gap-2 sm:grid-cols-2 text-sm text-slate-600 dark:text-slate-400">
            <p class="flex items-start gap-2 min-w-0">
              <AppLucideIcon name="calendar_today" class="text-lg shrink-0 text-primary-500 mt-0.5" />
              <span>{{ formatDateWithTime(ticket.event?.start_date || ticket.valid_from) }}</span>
            </p>
            <p class="flex items-start gap-2 min-w-0">
              <AppLucideIcon name="location_on" class="text-lg shrink-0 text-primary-500 mt-0.5" />
              <span class="line-clamp-2">{{ getVenueLine(ticket) }}</span>
            </p>
            <p class="flex items-start gap-2 min-w-0">
              <AppLucideIcon name="confirmation_number" class="text-lg shrink-0 text-primary-500 mt-0.5" />
              <span class="line-clamp-2">{{ ticket.ticket_type_name }}</span>
            </p>
            <p class="flex items-start gap-2 min-w-0">
              <AppLucideIcon name="payments" class="text-lg shrink-0 text-primary-500 mt-0.5" />
              <span>{{ formatPrice(ticket) }}</span>
            </p>
            <p class="flex items-start gap-2 sm:col-span-2 min-w-0">
              <AppLucideIcon name="person" class="text-lg shrink-0 text-primary-500 mt-0.5" />
              <span class="line-clamp-2">
                {{ fullName(ticket) }}
                <span v-if="ticket.user?.email" class="text-slate-400"> · {{ ticket.user.email }}</span>
              </span>
            </p>
            <p class="flex items-start gap-2 sm:col-span-2 min-w-0">
              <AppLucideIcon name="schedule" class="text-lg shrink-0 text-primary-500 mt-0.5" />
              <span>Valid until {{ formatDateWithTime(ticket.valid_until) }}</span>
            </p>
          </div>

          <div class="mt-auto pt-2 flex flex-wrap gap-2 lg:justify-end border-t border-slate-100 dark:border-slate-800">
            <button
              v-if="ticket.qr_code || isTicketValid(ticket)"
              type="button"
              class="btn-primary text-sm px-4 py-2.5 inline-flex items-center gap-2"
              @click="showQrCode(ticket)"
            >
              <AppLucideIcon name="qr_code_scanner" class="text-lg" />
              QR & check-in
            </button>
            <NuxtLink :to="`/attendee/events/${ticket.event_id}`" class="btn-secondary text-sm px-4 py-2.5 inline-flex items-center gap-2">
              <AppLucideIcon name="visibility" class="text-lg" />
              Event details
            </NuxtLink>
          </div>
        </div>
      </article>
    </div>

    <div v-if="loadingTickets && tickets.length > 0" class="flex justify-center py-4">
      <LoadingState text="Refreshing tickets…" />
    </div>

    <div class="rounded-2xl border border-primary-500/15 bg-primary-500/[0.06] dark:bg-primary-950/20 p-6 sm:p-8">
      <div class="flex flex-col sm:flex-row sm:items-center gap-4">
        <div class="size-12 rounded-2xl bg-primary-500/15 flex items-center justify-center text-primary-600 shrink-0">
          <AppLucideIcon name="add_circle" class="text-3xl" />
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">
            Need another ticket?
          </h3>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Explore live and upcoming events and complete checkout — tickets sync here automatically.
          </p>
        </div>
        <AppButton to="/attendee/events" icon="arrow_forward" icon-position="right" color="primary" class="shrink-0">
          Find events
        </AppButton>
      </div>
    </div>

    <AppModal v-model="qrModalOpen" max-width="md">
      <div v-if="selectedTicket" class="p-4 sm:p-6 text-center">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">
          {{ selectedTicket.event?.title }}
        </h3>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {{ selectedTicket.ticket_type_name }}
        </p>

        <div class="mx-auto mt-6 w-full max-w-[320px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-inner">
          <div v-if="qrCodeLoading" class="h-64 flex items-center justify-center">
            <LoadingState text="Generating QR…" />
          </div>
          <div v-else-if="qrCodeDataUrl" class="space-y-3">
            <img
              :src="qrCodeDataUrl"
              alt="Ticket QR code"
              class="mx-auto h-60 w-60 rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-2"
            >
          </div>
          <div v-else class="h-64 flex flex-col items-center justify-center text-slate-500 gap-2">
            <AppLucideIcon name="qr_code_2" class="text-5xl opacity-40" />
            <p class="text-sm">
              QR unavailable — show ticket number at the door.
            </p>
          </div>
        </div>

        <p class="mt-4 font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">
          {{ selectedTicket.ticket_number }}
        </p>
        <p class="mt-1 text-xs text-slate-500">
          {{ fullName(selectedTicket) }} · {{ selectedTicket.user?.email || '—' }}
        </p>
        <p class="mt-3 text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          Present this code at check-in. Brightness up helps scanners read it quickly.
        </p>
        <AppButton class="mt-6 w-full max-w-xs mx-auto justify-center" color="neutral" @click="qrModalOpen = false">
          Close
        </AppButton>
      </div>
    </AppModal>
  </div>
</template>
