<script setup lang="ts">
import type { Event, PaginatedResponse, Session } from '~/types'
import { getEventCoverImageUrl } from '~/utils/eventImage'
import { getEventCapacityPercentage, getFullName } from '~/types'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee'
})

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const api = useApi()
const eventsStore = useEventsStore()
const sessionsStore = useSessionsStore()
const registrationStore = useRegistrationStore()
const notifications = useNotifications()
const { user } = useAuth()

const eventId = computed(() => String(route.params.id ?? ''))

const pageLoading = ref(true)
const lineupLoading = ref(false)
const bookingLoading = ref(false)
const relatedLoading = ref(false)

const activeTab = ref<'about' | 'lineup' | 'reviews'>('about')
const selectedTicketTypeId = ref<string | null>(null)
const quantity = ref(1)
const savedToggle = ref(false)

const eventSessions = ref<Session[]>([])
const relatedEvents = ref<Event[]>([])

const tabs = [
  { id: 'about' as const, label: 'About the Event' },
  { id: 'lineup' as const, label: 'Artist Lineup' },
  { id: 'reviews' as const, label: 'Reviews' }
]

const event = computed<Event | null>(() => {
  const ev = eventsStore.currentEvent
  if (!ev || String(ev.id) !== eventId.value) return null
  return ev
})

const bookableTicketTypes = computed(() => {
  const types = event.value?.ticket_types ?? []
  return types.filter(t => t.status === 'available' && t.quantity > t.sold_count)
})

const selectedTicketType = computed(() => {
  if (!selectedTicketTypeId.value || !event.value) return null
  return event.value.ticket_types.find(t => t.id === selectedTicketTypeId.value) ?? null
})

const capacityPercent = computed(() => {
  if (!event.value) return 0
  return Math.min(100, getEventCapacityPercentage(event.value))
})

const minPrice = computed(() => {
  const types = event.value?.ticket_types?.filter(t => t.price >= 0 && t.status === 'available') ?? []
  if (types.length === 0) return null
  return Math.min(...types.map(t => t.price))
})

const startingPriceLabel = computed(() => {
  const types = bookableTicketTypes.value
  if (types.length === 0) {
    const fallback = event.value?.ticket_types?.filter(t => t.price >= 0) ?? []
    if (fallback.length === 0) return 'Free'
    const m = Math.min(...fallback.map(t => t.price))
    if (m === 0) return 'Free'
    return formatMoney(m, fallback[0]?.currency || 'TZS')
  }
  if (minPrice.value === null || minPrice.value === 0) return 'Free'
  return formatMoney(minPrice.value, types[0]?.currency || 'TZS')
})

const maxQuantity = computed(() => {
  const t = selectedTicketType.value
  if (!t) return 1
  const remaining = Math.max(0, t.quantity - t.sold_count)
  const cap = Math.min(t.max_per_order || remaining, remaining)
  return Math.max(1, cap || 1)
})

watch(maxQuantity, (max) => {
  if (quantity.value > max) quantity.value = max
})

watch(bookableTicketTypes, (types) => {
  if (types.length === 0) {
    selectedTicketTypeId.value = null
    return
  }
  if (!selectedTicketTypeId.value || !types.some(t => t.id === selectedTicketTypeId.value)) {
    selectedTicketTypeId.value = types[0]?.id ?? null
  }
})

function getEventImage(ev: Event): string {
  return getEventCoverImageUrl(
    ev.cover_image,
    String(config.public.apiBase ?? ''),
    `https://picsum.photos/seed/event-${ev.id}/1200/675`
  )
}

function formatEventDateTime(dateString: string): string {
  const d = new Date(dateString)
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${date} • ${time}`
}

function formatSessionWhen(dateString: string): string {
  const d = new Date(dateString)
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
}

function formatMoney(amount: number, currency: string): string {
  if (amount === 0) return 'Free'
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'TZS' }).format(amount)
  }
  catch {
    return `${amount.toLocaleString()} ${currency}`
  }
}

function getLocationLine(ev: Event): string {
  const v = ev.venue
  if (!v) return '—'
  if (v.type === 'virtual') return 'Online'
  return [v.name, v.city].filter(Boolean).join(', ')
}

function getFullAddress(ev: Event): string {
  const v = ev.venue
  if (!v || v.type === 'virtual') return ''
  return [v.address, v.city, v.country].filter(Boolean).join(', ')
}

function directionsUrl(ev: Event): string {
  const v = ev.venue
  if (!v) return '#'
  if (v.coordinates) {
    return `https://www.google.com/maps/dir/?api=1&destination=${v.coordinates.lat},${v.coordinates.lng}`
  }
  const q = [v.name, v.address, v.city, v.country].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

function descriptionParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
}

function relatedEventPriceLabel(ev: Event): string {
  const types = ev.ticket_types?.filter(t => t.price >= 0) ?? []
  if (types.length === 0) return 'Free'
  const m = Math.min(...types.map(t => t.price))
  if (m === 0) return 'Free'
  return formatMoney(m, types[0]?.currency || 'TZS')
}

async function loadLineup(id: string) {
  lineupLoading.value = true
  try {
    await sessionsStore.fetchEventSessions(id)
    eventSessions.value = sessionsStore.getEventSessionsFromCache(id).filter(s => !s.is_break && s.status !== 'cancelled')
  }
  catch {
    eventSessions.value = []
  }
  finally {
    lineupLoading.value = false
  }
}

async function loadRelated(ev: Event) {
  relatedLoading.value = true
  try {
    const params = new URLSearchParams()
    params.append('page', '1')
    params.append('per_page', '6')
    params.append('status', 'published')
    params.append('visibility', 'public')
    const cat = ev.categories?.[0]
    if (cat) params.append('category', cat)
    const res = await api.get<PaginatedResponse<Event>>(`/events/?${params.toString()}`)
    relatedEvents.value = res.data.filter(e => e.id !== ev.id).slice(0, 3)
  }
  catch {
    relatedEvents.value = []
  }
  finally {
    relatedLoading.value = false
  }
}

async function loadPage() {
  const id = eventId.value
  if (!id) {
    pageLoading.value = false
    return
  }
  pageLoading.value = true
  try {
    const ev = await eventsStore.fetchEvent(id)
    if (!ev) {
      notifications.error('Event not found')
      await router.replace('/attendee/events')
      return
    }
    quantity.value = 1
    await Promise.all([loadLineup(id), loadRelated(ev)])
  }
  finally {
    pageLoading.value = false
  }
}

watch(eventId, () => {
  void loadPage()
}, { immediate: true })

function incQty() {
  if (quantity.value < maxQuantity.value) quantity.value += 1
}

function decQty() {
  if (quantity.value > 1) quantity.value -= 1
}

async function handleBook() {
  if (!event.value || !selectedTicketType.value) {
    notifications.error('Select a ticket type')
    return
  }
  bookingLoading.value = true
  try {
    await registrationStore.registerForEvent({
      event_id: event.value.id,
      ticket_type_id: selectedTicketType.value.id,
      quantity: quantity.value
    })
    notifications.success('You are registered! Check My Tickets.')
    await router.push('/attendee/tickets')
  }
  catch {
    notifications.error(registrationStore.error?.message || 'Booking failed')
  }
  finally {
    bookingLoading.value = false
  }
}

async function shareEvent() {
  const url = typeof window !== 'undefined' ? window.location.href : ''
  try {
    if (navigator.share && event.value) {
      await navigator.share({ title: event.value.title, url })
    }
    else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
      notifications.success('Link copied')
    }
  }
  catch {
    /* user cancelled share */
  }
}

function toggleSaved() {
  savedToggle.value = !savedToggle.value
  notifications.info(savedToggle.value ? 'Saved (demo)' : 'Removed from saved (demo)')
}

const organizerLine = computed(() => {
  const o = event.value?.organizer
  if (!o) return null
  return {
    name: getFullName(o),
    avatar: o.avatar,
    id: o.id
  }
})
</script>

<template>
  <div class="min-h-full -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-12 bg-background-light dark:bg-background-dark">
    <div v-if="pageLoading" class="py-24 flex justify-center">
      <LoadingState text="Loading event..." />
    </div>

    <template v-else-if="event">
      <!-- Breadcrumbs -->
      <nav class="flex flex-wrap items-center gap-2 mb-8 text-sm font-medium">
        <NuxtLink to="/attendee" class="text-primary-500 hover:underline">
          Home
        </NuxtLink>
        <span class="text-slate-400 material-symbols-outlined text-xs">chevron_right</span>
        <NuxtLink to="/attendee/events" class="text-primary-500 hover:underline">
          Events
        </NuxtLink>
        <span class="text-slate-400 material-symbols-outlined text-xs">chevron_right</span>
        <span class="text-slate-500 dark:text-slate-400">
          {{ event.slug || 'Event' }}
        </span>
      </nav>

      <div class="flex flex-col lg:flex-row gap-10 lg:gap-12 max-w-[1280px]">
        <!-- Left column -->
        <div class="flex-1 min-w-0 space-y-10">
          <div class="space-y-4  ">
            <div class="flex flex-wrap gap-4">
              <span
                v-for="(cat, idx) in (event.categories || []).slice(0, 2)"
                :key="cat"
                :class="[
                  'px-1.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                  idx === 0
                    ? 'bg-primary-500/10 text-primary-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                ]"
              >
                #{{ cat.name }}
              </span>
              <span
                v-if="!event.categories?.length"
                class="bg-primary-500/10 text-primary-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              >
                Event
              </span>
            </div>
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {{ event.title }}
            </h1>
            <div class="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4 sm:gap-6 text-slate-600 dark:text-slate-400">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary-500">calendar_today</span>
                <span class="text-sm">{{ formatEventDateTime(event.start_date) }}</span>
              </div>
              <div class="flex items-center gap-2 min-w-0">
                <span class="material-symbols-outlined text-primary-500 shrink-0">location_on</span>
                <span class="text-sm truncate">{{ getLocationLine(event) }}</span>
              </div>
            </div>
          </div>

          <div class="rounded-2xl overflow-hidden shadow-2xl shadow-primary-500/10 group border border-primary-500/10">
            <div
              class="w-full bg-center bg-no-repeat bg-cover aspect-video transition-transform duration-700 group-hover:scale-[1.02]"
              :style="{ backgroundImage: `url('${getEventImage(event)}')` }"
              role="img"
              :aria-label="event.title"
            />
          </div>

          <!-- Tabs -->
          <div class="border-b border-primary-500/10 flex gap-6 sm:gap-10 overflow-x-auto no-scrollbar">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              :class="[
                'pb-4 border-b-2 whitespace-nowrap text-sm sm:text-base transition-colors font-semibold shrink-0',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-500 font-bold'
                  : 'border-transparent text-slate-500 hover:text-primary-500'
              ]"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Tab panels -->
          <div v-show="activeTab === 'about'" class="space-y-6 animate-fade-in">
            <h3 v-if="event.short_description" class="text-2xl font-bold text-slate-900 dark:text-white">
              {{ event.short_description }}
            </h3>
            <div v-else class="text-2xl font-bold text-slate-900 dark:text-white">
              About this event
            </div>
            <div class="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed text-base">
              <p v-for="(para, i) in descriptionParagraphs(event.description || 'No description yet.')" :key="i">
                {{ para }}
              </p>
            </div>
          </div>

          <div v-show="activeTab === 'lineup'" class="space-y-4 animate-fade-in">
            <div v-if="lineupLoading" class="py-8 flex justify-center">
              <LoadingState text="Loading lineup..." />
            </div>
            <ul v-else-if="eventSessions.length" class="space-y-3">
              <li
                v-for="s in eventSessions"
                :key="s.id"
                class="rounded-xl border border-primary-500/10 bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <p class="font-bold text-slate-900 dark:text-white">
                    {{ s.title }}
                  </p>
                  <p v-if="s.description" class="text-sm text-slate-500 mt-1 line-clamp-2">
                    {{ s.description }}
                  </p>
                  <div v-if="s.speakers?.length" class="mt-2 flex flex-wrap gap-2">
                    <span
                      v-for="sp in s.speakers"
                      :key="sp.id"
                      class="text-xs font-medium px-2 py-0.5 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400"
                    >
                      {{ sp.name }}
                    </span>
                  </div>
                </div>
                <p class="text-sm text-slate-500 shrink-0 font-medium">
                  {{ formatSessionWhen(s.start_time) }}
                </p>
              </li>
            </ul>
            <p v-else class="text-slate-500 dark:text-slate-400">
              Lineup and schedule details will appear here when the organizer adds sessions.
            </p>
          </div>

          <div v-show="activeTab === 'reviews'" class="animate-fade-in py-8 text-center rounded-xl border border-dashed border-primary-500/20 bg-white/50 dark:bg-slate-900/50">
            <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">rate_review</span>
            <p class="mt-2 text-slate-600 dark:text-slate-400 font-medium">
              No reviews yet
            </p>
            <p class="text-sm text-slate-500 mt-1">
              Be among the first to attend and share your experience.
            </p>
          </div>

          <!-- Location -->
          <div class="space-y-4">
            <h3 class="text-2xl font-bold text-slate-900 dark:text-white">
              Location
            </h3>
            <div class="rounded-xl overflow-hidden h-72 sm:h-80 relative border border-primary-500/10 bg-slate-200 dark:bg-slate-800">
              <div class="absolute inset-0 bg-primary-500/5 flex items-center justify-center">
                <div class="flex flex-col items-center gap-2 px-4 text-center">
                  <span class="material-symbols-outlined text-4xl text-primary-500 animate-bounce">location_on</span>
                  <span class="font-bold text-slate-600 dark:text-slate-300">{{ event.venue?.name || getLocationLine(event) }}</span>
                </div>
              </div>
            </div>
            <div
              v-if="event.venue?.type !== 'virtual'"
              class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 bg-primary-500/5 rounded-xl border border-primary-500/10"
            >
              <div class="min-w-0">
                <p class="font-bold text-slate-900 dark:text-white">
                  {{ event.venue?.name || 'Venue' }}
                </p>
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  {{ getFullAddress(event) || getLocationLine(event) }}
                </p>
              </div>
              <a
                :href="directionsUrl(event)"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-primary-500 font-bold hover:underline shrink-0"
              >
                <span class="material-symbols-outlined text-sm">directions</span>
                Get Directions
              </a>
            </div>
            <div
              v-else
              class="p-4 bg-primary-500/5 rounded-xl border border-primary-500/10 text-slate-600 dark:text-slate-400 text-sm"
            >
              This is an online event<span v-if="event.venue?.virtual_url"> —
                <a :href="event.venue.virtual_url" class="text-primary-500 font-semibold hover:underline" target="_blank" rel="noopener">Join link</a>
              </span>.
            </div>
          </div>

          <!-- Organizer -->
          <div
            v-if="organizerLine"
            class="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6"
          >
            <div class="flex items-center gap-4 min-w-0">
              <div
                v-if="organizerLine.avatar"
                class="size-16 rounded-full bg-center bg-cover border-2 border-primary-500 shrink-0"
                :style="{ backgroundImage: `url('${organizerLine.avatar}')` }"
              />
              <div
                v-else
                class="size-16 rounded-full bg-primary-500/10 border-2 border-primary-500 flex items-center justify-center text-primary-600 font-bold text-xl shrink-0"
              >
                {{ organizerLine.name.charAt(0) }}
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-primary-500 uppercase tracking-widest">
                  Organized by
                </p>
                <h4 class="text-xl font-bold text-slate-900 dark:text-white truncate">
                  {{ organizerLine.name }}
                </h4>
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  {{ event.settings?.show_attendee_count ? `${event.registered_count} registered` : 'Event organizer' }}
                </p>
              </div>
            </div>
            <div class="flex gap-3 shrink-0">
              <button type="button" class="btn-outline px-5 py-2 text-sm" @click="notifications.info('Follow is coming soon')">
                Follow
              </button>
              <a
                v-if="event.organizer?.email"
                :href="`mailto:${event.organizer.email}?subject=${encodeURIComponent('Question about: ' + event.title)}`"
                class="p-2 border-2 border-primary-500/20 text-slate-400 rounded-xl hover:text-primary-500 transition-colors inline-flex items-center justify-center"
                aria-label="Email organizer"
              >
                <span class="material-symbols-outlined">mail</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:w-[400px] shrink-0">
          <div class="lg:sticky lg:top-28 space-y-6">
            <div class="card p-6 shadow-xl space-y-6">
              <div class="space-y-2">
                <div class="flex justify-between items-center gap-3">
                  <span class="text-slate-500 dark:text-slate-400 font-semibold text-sm">Tickets starting from</span>
                  <span class="text-primary-500 font-black text-2xl tabular-nums">
                    {{ startingPriceLabel }}
                  </span>
                </div>
                <div class="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    class="bg-primary-500 h-full transition-all duration-500"
                    :style="{ width: `${capacityPercent}%` }"
                  />
                </div>
                <p class="text-xs text-right text-slate-400">
                  {{ capacityPercent }}% of capacity filled
                </p>
              </div>

              <div v-if="bookableTicketTypes.length" class="space-y-4">
                <button
                  v-for="t in bookableTicketTypes"
                  :key="t.id"
                  type="button"
                  :class="[
                    'w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer',
                    selectedTicketTypeId === t.id
                      ? 'border-primary-500 bg-primary-500/5'
                      : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:border-primary-500/50'
                  ]"
                  @click="selectedTicketTypeId = t.id"
                >
                  <div class="flex justify-between items-center gap-2 mb-1">
                    <span class="font-bold text-slate-900 dark:text-white">{{ t.name }}</span>
                    <span class="font-bold text-slate-900 dark:text-white tabular-nums">{{ formatMoney(t.price, t.currency) }}</span>
                  </div>
                  <p v-if="t.description" class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {{ t.description }}
                  </p>
                </button>
              </div>
              <p v-else class="text-sm text-slate-500 dark:text-slate-400">
                No tickets are available for sale right now.
              </p>

              <div v-if="bookableTicketTypes.length" class="space-y-3">
                <label class="text-sm font-bold text-slate-900 dark:text-white block">Quantity</label>
                <div class="flex items-center justify-between border border-primary-500/20 rounded-xl p-2 bg-white dark:bg-slate-900">
                  <button
                    type="button"
                    class="size-9 flex items-center justify-center rounded-lg bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-colors disabled:opacity-40"
                    :disabled="quantity <= 1"
                    @click="decQty"
                  >
                    <span class="material-symbols-outlined text-lg">remove</span>
                  </button>
                  <span class="font-bold text-lg tabular-nums">{{ quantity }}</span>
                  <button
                    type="button"
                    class="size-9 flex items-center justify-center rounded-lg bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-colors disabled:opacity-40"
                    :disabled="quantity >= maxQuantity"
                    @click="incQty"
                  >
                    <span class="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>
                <p class="text-xs text-slate-400">
                  Max {{ maxQuantity }} per order for this ticket type.
                </p>
              </div>

              <div class="space-y-3">
                <button
                  type="button"
                  class="w-full btn-primary py-4 text-lg justify-center disabled:opacity-50 disabled:pointer-events-none"
                  :disabled="!bookableTicketTypes.length || bookingLoading"
                  @click="handleBook"
                >
                  {{ bookingLoading ? 'Booking…' : 'Get Tickets' }}
                </button>
                <p class="text-[10px] text-center text-slate-400 leading-relaxed">
                  No hidden fees. Cancellation policies are set by the organizer.
                </p>
              </div>
            </div>

            <div class="card p-6">
              <p class="text-sm font-bold text-slate-900 dark:text-white mb-4">
                Share with friends
              </p>
              <div class="flex gap-4">
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-primary-500/10 text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-all"
                  @click="shareEvent"
                >
                  <span class="material-symbols-outlined text-lg">share</span>
                  <span class="text-xs font-bold">Share</span>
                </button>
                <button
                  type="button"
                  class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-600 dark:text-slate-400 hover:text-red-500 transition-all"
                  @click="toggleSaved"
                >
                  <span class="material-symbols-outlined text-lg">{{ savedToggle ? 'favorite' : 'favorite' }}</span>
                  <span class="text-xs font-bold">{{ savedToggle ? 'Saved' : 'Save' }}</span>
                </button>
              </div>
              <div class="mt-6 pt-6 border-t border-primary-500/10 flex justify-center gap-6 text-slate-400">
                <span class="material-symbols-outlined cursor-default opacity-50" title="Social links">public</span>
                <span class="material-symbols-outlined cursor-default opacity-50" title="Social links">groups</span>
                <span class="material-symbols-outlined cursor-default opacity-50" title="Social links">alternate_email</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related -->
      <div class="max-w-[1280px] mx-auto mt-16 sm:mt-20 space-y-8">
        <div class="flex justify-between items-center gap-4">
          <h3 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            More Events You'll Love
          </h3>
          <NuxtLink to="/attendee/events" class="text-primary-500 font-bold hover:underline flex items-center gap-1 text-sm sm:text-base shrink-0">
            See All
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </NuxtLink>
        </div>

        <div v-if="relatedLoading" class="py-12 flex justify-center">
          <LoadingState text="Loading suggestions..." />
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <NuxtLink
            v-for="ev in relatedEvents"
            :key="ev.id"
            :to="`/attendee/events/${ev.id}`"
            class="card-hover overflow-hidden group flex flex-col"
          >
            <div
              class="h-48 bg-cover bg-center relative"
              :style="{ backgroundImage: `url('${getEventImage(ev)}')` }"
            >
              <div class="p-3">
                <span class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-primary-500 px-3 py-1 rounded-lg text-xs font-bold">
                  {{ relatedEventPriceLabel(ev) }}
                </span>
              </div>
            </div>
            <div class="p-5 space-y-3 flex-1 flex flex-col">
              <h4 class="font-bold text-xl text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-2">
                {{ ev.title }}
              </h4>
              <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                {{ ev.short_description || ev.description }}
              </p>
              <div class="flex items-center gap-2 text-xs text-slate-400 font-medium mt-auto">
                <span class="material-symbols-outlined text-sm">calendar_month</span>
                {{ formatEventDateTime(ev.start_date) }}
              </div>
            </div>
          </NuxtLink>
        </div>

        <p v-if="!relatedLoading && relatedEvents.length === 0" class="text-center text-slate-500 dark:text-slate-400 py-8">
          Explore more on the
          <NuxtLink to="/attendee/events" class="text-primary-500 font-semibold hover:underline">events page</NuxtLink>.
        </p>
      </div>
    </template>
  </div>
</template>
