<script setup lang="ts">
import type { Event, Session, TicketType } from '~/types'
import { unwrapList } from '~/utils/unwrapApiResource'
import { getEventCoverImageUrl } from '~/utils/eventImage'
import EventHero from '~/components/attendee/events/EventHero.vue'
import TicketSelectionCard from '~/components/attendee/events/TicketSelectionCard.vue'
import FreeRegistrationForm from '~/components/attendee/events/FreeRegistrationForm.vue'
import CheckoutSummary from '~/components/attendee/events/CheckoutSummary.vue'
import EventOrganizerCard from '~/components/attendee/events/AttendeeEventOrganizerCard.vue'
import EventVenueCard from '~/components/attendee/events/AttendeeEventVenueCard.vue'
import RelatedEvents from '~/components/attendee/events/RelatedEvents.vue'
import AppButton from '~/components/ui/AppButton.vue'
import {
  cartHasFreeAndPaid,
  expandTicketLines,
  filterPurchasableTicketTypes,
  maxSelectableForTicket,
  remainingForTicket,
  resizeAttendeeSlots,
  submitEventBooking,
  totalQuantity,
  useAttendeeEventBookingPrefill,
  type AttendeeSlotInput,
} from '~/composables/useAttendeeEventBooking'
import { clearBookingSession, loadBookingSession, watchPersistBookingSession } from '~/composables/useBookingSession'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee',
})

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const api = useApi()
const eventsStore = useEventsStore()
const sessionsStore = useSessionsStore()
const registrationStore = useRegistrationStore()
const notifications = useNotifications()

const eventId = computed(() => String(route.params.id ?? ''))

const pageLoading = ref(true)
const lineupLoading = ref(false)
const bookingLoading = ref(false)
const relatedLoading = ref(false)

const activeTab = ref<'about' | 'lineup' | 'reviews'>('about')
const quantities = reactive<Record<string, number>>({})
const attendeeSlots = ref<AttendeeSlotInput[]>([])

const eventSessions = ref<Session[]>([])
const relatedEvents = ref<Event[]>([])

const tabs = [
  { id: 'about' as const, label: 'About' },
  { id: 'lineup' as const, label: 'Lineup' },
  { id: 'reviews' as const, label: 'Reviews' },
]

const { defaultSlot } = useAttendeeEventBookingPrefill()

const event = computed<Event | null>(() => {
  const ev = eventsStore.currentEvent
  if (!ev || String(ev.id) !== eventId.value) return null
  return ev
})

const catalogTypes = computed(() => event.value?.ticket_types ?? [])

const expansionTypes = computed(() => {
  const ok = new Set(
    filterPurchasableTicketTypes(catalogTypes.value, new Date()).map(t => t.id),
  )
  return catalogTypes.value.filter(t => ok.has(t.id))
})

const linesSelected = computed(() =>
  expandTicketLines(expansionTypes.value, quantities).filter(l => l.quantity > 0),
)

const typesById = computed(() => new Map((event.value?.ticket_types ?? []).map(t => [t.id, t])))

const totalTickets = computed(() => totalQuantity(linesSelected.value))

const mixedCart = computed(() =>
  cartHasFreeAndPaid(linesSelected.value, typesById.value).hasMixed,
)

const capacityPercent = computed(() => {
  const ev = event.value
  if (!ev || ev.capacity === 0) return 0
  return Math.min(100, Math.round((ev.registered_count / ev.capacity) * 100))
})

const paidSubtotal = computed(() => {
  let sum = 0
  for (const line of linesSelected.value) {
    const tt = typesById.value.get(line.ticket_type_id)
    if (!tt || Number(tt.price) <= 0) continue
    sum += Number(tt.price) * line.quantity
  }
  return sum
})

const ctaLabel = computed(() => {
  if (totalTickets.value === 0) return 'Select tickets'
  if (paidSubtotal.value > 0 && mixedCart.value) return 'Register & checkout'
  if (paidSubtotal.value > 0) return 'Proceed to checkout'
  return 'Register free'
})

function isPurchasable(tt: TicketType): boolean {
  return filterPurchasableTicketTypes([tt], new Date()).length > 0
}

function ticketStatusNote(tt: TicketType): string | null {
  const now = new Date()
  if (tt.status !== 'available') {
    if (tt.status === 'sold_out') return 'Sold out'
    if (tt.status === 'expired') return 'Sales ended'
    if (tt.status === 'hidden') return 'Unavailable'
    return 'Unavailable'
  }
  const remaining = remainingForTicket(tt)
  if (remaining <= 0) return 'Sold out'
  if (now < new Date(tt.sales_start)) return 'Not on sale yet'
  if (now > new Date(tt.sales_end)) return 'Sales closed'
  if (remaining <= 15) return `${remaining} left`
  return null
}

function updateQty(ticketId: string, q: number) {
  quantities[ticketId] = q
}

watch(
  catalogTypes,
  (types) => {
    for (const t of types) {
      if (quantities[t.id] === undefined) quantities[t.id] = 0
    }
    /* eslint-disable @typescript-eslint/no-dynamic-delete -- drop ticket types removed from catalog */
    for (const key of Object.keys(quantities)) {
      if (!types.some(t => t.id === key)) delete quantities[key]
    }
    /* eslint-enable @typescript-eslint/no-dynamic-delete */
  },
  { immediate: true },
)

watch(
  () => catalogTypes.value.map(t => `${t.id}:${isPurchasable(t)}`).join('|'),
  () => {
    for (const t of catalogTypes.value) {
      if (!isPurchasable(t)) quantities[t.id] = 0
    }
  },
)

watch(
  [totalTickets, defaultSlot],
  ([n, slot]) => {
    attendeeSlots.value = resizeAttendeeSlots(attendeeSlots.value, n, slot)
  },
  { immediate: true },
)

let stopPersist: (() => void) | null = null

watch(
  eventId,
  (id) => {
    stopPersist?.()
    stopPersist = null
    if (!id) return
    stopPersist = watchPersistBookingSession(eventId, () => ({
      quantities: { ...quantities },
      attendees: attendeeSlots.value.map(a => ({ ...a })),
    }))
  },
  { immediate: true },
)

onBeforeUnmount(() => stopPersist?.())

function applyPersisted(state: ReturnType<typeof loadBookingSession>): void {
  if (!state) return
  for (const [k, v] of Object.entries(state.quantities)) {
    if (typeof v === 'number' && v >= 0) quantities[k] = v
  }
  if (state.attendees?.length) {
    attendeeSlots.value = state.attendees.map(a => ({
      attendee_name: a.attendee_name,
      attendee_email: a.attendee_email,
      attendee_phone: a.attendee_phone,
    }))
  }
}

function getEventImage(ev: Event): string {
  return getEventCoverImageUrl(
    ev.cover_image,
    String(config.public.apiBase ?? ''),
    `https://picsum.photos/seed/event-${ev.id}/1200/675`,
  )
}

function formatEventDateTime(dateString: string): string {
  const d = new Date(dateString)
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${date} · ${time}`
}

function formatSessionWhen(dateString: string): string {
  const d = new Date(dateString)
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
}

function formatMoney(amount: number, currency: string): string {
  if (amount <= 0) return 'Free'
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

function organizerLabel(ev: Event): string | null {
  const o = ev.organizer
  if (!o) return ev.organizer_name ?? null
  return [o.first_name, o.last_name].filter(Boolean).join(' ').trim() || o.email || null
}

const heroMeta = computed(() => {
  const ev = event.value
  if (!ev) {
    return {
      formattedRange: '',
      ticketStatusLabel: '',
      locationLabel: '',
      organizerLine: null as string | null,
    }
  }
  const purch = filterPurchasableTicketTypes(ev.ticket_types ?? [], new Date())
  let ticketStatusLabel = 'Check availability'
  if (!purch.length) ticketStatusLabel = 'Tickets unavailable'
  else if (purch.every(p => Number(p.price) <= 0)) ticketStatusLabel = 'Free registration open'
  else ticketStatusLabel = 'Paid tickets on sale'
  return {
    formattedRange: `${formatEventDateTime(ev.start_date)} (${ev.timezone})`,
    ticketStatusLabel,
    locationLabel: getLocationLine(ev),
    organizerLine: organizerLabel(ev),
  }
})

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
    const catName = typeof cat === 'string' ? cat : cat && typeof cat === 'object' && 'name' in cat
      ? String((cat as { name?: string }).name)
      : ''
    if (catName) params.append('category', catName)
    const res = await api.get<unknown>(`/events/?${params.toString()}`)
    const { data } = unwrapList<Event>(res)
    relatedEvents.value = data.filter(e => e.id !== ev.id).slice(0, 3)
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
    for (const t of ev.ticket_types ?? []) {
      if (quantities[t.id] === undefined) quantities[t.id] = 0
    }
    applyPersisted(loadBookingSession(id))
    await Promise.all([
      loadLineup(id),
      loadRelated(ev),
      eventsStore.fetchMySavedEvents(),
    ])
  }
  finally {
    pageLoading.value = false
  }
}

watch(eventId, () => {
  void loadPage()
}, { immediate: true })

async function handleBook() {
  const ev = event.value
  if (!ev || totalTickets.value === 0) {
    notifications.error('Select at least one ticket')
    return
  }
  bookingLoading.value = true
  try {
    const result = await submitEventBooking({
      api,
      event: ev,
      orderedTypes: expansionTypes.value,
      quantities,
      attendees: attendeeSlots.value,
    })
    await registrationStore.fetchUserRegistrations()
    clearBookingSession(ev.id)
    if (result.kind === 'free_done') {
      notifications.success('You are registered! Your tickets are in My Tickets.')
      await router.push('/attendee/tickets')
      return
    }
    if (result.orderId) {
      notifications.success('Reservation created — complete payment to confirm.')
      await router.push(`/checkout/${result.orderId}`)
    }
  }
  catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string; statusCode?: number }
    if (err?.statusCode === 409) return
    notifications.error(err?.data?.message || err?.message || 'Booking failed')
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

async function toggleSavedEv() {
  const ev = event.value
  if (!ev) return
  await eventsStore.toggleSavedEvent(ev.id, !eventsStore.isEventSaved(ev.id))
}
</script>

<template>
  <div class="min-h-full pb-28 lg:pb-12 space-y-8">
    <div v-if="pageLoading" class="py-24 flex justify-center">
      <LoadingState text="Loading event…" />
    </div>

    <template v-else-if="event">
      <nav class="flex flex-wrap items-center gap-2 text-sm font-medium">
        <NuxtLink to="/attendee" class="text-primary-500 hover:underline">
          Home
        </NuxtLink>
        <AppLucideIcon name="chevron_right" class="text-slate-400 text-xs" />
        <NuxtLink to="/attendee/events" class="text-primary-500 hover:underline">
          Events
        </NuxtLink>
        <AppLucideIcon name="chevron_right" class="text-slate-400 text-xs" />
        <span class="text-slate-500 dark:text-slate-400 truncate max-w-[12rem] sm:max-w-md">
          {{ event.title }}
        </span>
      </nav>

      <div class="flex flex-wrap gap-2">
        <NuxtLink
          to="/attendee/tickets"
          class="inline-flex items-center gap-2 rounded-xl border border-primary-500/30 bg-primary-500/10 px-4 py-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-500/15 transition-colors"
        >
          <AppLucideIcon name="confirmation_number" class="text-base" />
          View my tickets
        </NuxtLink>
        <NuxtLink
          to="/attendee"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-primary-500/40 transition-colors"
        >
          Dashboard
        </NuxtLink>
      </div>

      <EventHero
        :event="event"
        :hero-image-url="getEventImage(event)"
        :organizer-label="heroMeta.organizerLine"
        :location-label="heroMeta.locationLabel"
        :formatted-range="heroMeta.formattedRange"
        :ticket-status-label="heroMeta.ticketStatusLabel"
        :capacity-percent="capacityPercent"
      />

      <div class="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
        <div class="flex-1 min-w-0 space-y-10 order-2 lg:order-1">
          <div class="border-b border-slate-200 dark:border-slate-800 flex gap-6 overflow-x-auto no-scrollbar">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              :class="[
                'pb-3 border-b-2 whitespace-nowrap text-sm font-semibold shrink-0 transition-colors',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
              ]"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <div v-show="activeTab === 'about'" class="space-y-4 animate-fade-in">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">
              About
            </h2>
            <div class="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              <p v-for="(para, i) in descriptionParagraphs(event.description || 'No description yet.')" :key="i">
                {{ para }}
              </p>
            </div>
          </div>

          <div v-show="activeTab === 'lineup'" class="space-y-4 animate-fade-in">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">
              Lineup & schedule
            </h2>
            <div v-if="lineupLoading" class="py-8 flex justify-center">
              <LoadingState text="Loading lineup…" />
            </div>
            <ul v-else-if="eventSessions.length" class="space-y-3">
              <li
                v-for="s in eventSessions"
                :key="s.id"
                class="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
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
            <p v-else class="text-slate-500 dark:text-slate-400 text-sm">
              Sessions will appear here when the organizer publishes the lineup.
            </p>
          </div>

          <div v-show="activeTab === 'reviews'" class="animate-fade-in py-10 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
            <AppLucideIcon name="rate_review" class="text-4xl text-slate-300 dark:text-slate-600" />
            <p class="mt-2 text-slate-600 dark:text-slate-400 font-medium">
              Reviews coming soon
            </p>
          </div>

          <EventVenueCard
            :event="event"
            :location-line="getLocationLine(event)"
            :full-address="getFullAddress(event)"
            :directions-href="directionsUrl(event)"
          />

          <EventOrganizerCard :event="event" />
        </div>

        <aside class="w-full lg:w-[420px] shrink-0 space-y-4 order-1 lg:order-2 lg:sticky lg:top-28">
          <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg p-5 space-y-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="text-lg font-black text-slate-900 dark:text-white">
                  Tickets
                </h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Pick one or more ticket types. Inventory updates in real time.
                </p>
              </div>
              <button
                type="button"
                class="rounded-full border border-slate-200 dark:border-slate-700 p-2 text-slate-500 hover:text-primary-500 transition-colors"
                :disabled="eventsStore.isSavingEvent(event.id)"
                :aria-label="eventsStore.isEventSaved(event.id) ? 'Remove saved event' : 'Save event'"
                @click="toggleSavedEv"
              >
                <AppLucideIcon :name="eventsStore.isEventSaved(event.id) ? 'favorite' : 'favorite_border'" />
              </button>
            </div>

            <div
              v-if="mixedCart"
              class="rounded-xl bg-amber-50 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-900/40 px-3 py-2 text-xs text-amber-900 dark:text-amber-100"
            >
              Your cart mixes free and paid tickets. Free registrations are confirmed first, then you&apos;ll continue to checkout for paid seats.
            </div>

            <div class="space-y-3">
              <TicketSelectionCard
                v-for="tt in catalogTypes"
                :key="tt.id"
                :ticket="tt"
                :quantity="quantities[tt.id] ?? 0"
                :max-quantity="maxSelectableForTicket(tt)"
                :disabled="!isPurchasable(tt)"
                :status-note="ticketStatusNote(tt)"
                @update:quantity="updateQty(tt.id, $event)"
              />
            </div>

            <CheckoutSummary
              v-if="totalTickets > 0"
              :lines="linesSelected"
              :types-by-id="typesById"
            />

            <FreeRegistrationForm
              v-if="totalTickets > 0"
              :attendees="attendeeSlots"
              :disabled="bookingLoading"
              @update:attendees="attendeeSlots = $event"
            />

            <div class="hidden lg:block space-y-3">
              <AppButton
                color="primary"
                block
                class="min-h-12 text-base font-bold"
                icon="arrow_forward"
                icon-position="right"
                :disabled="bookingLoading || totalTickets === 0"
                @click="handleBook"
              >
                {{ bookingLoading ? 'Working…' : ctaLabel }}
              </AppButton>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  @click="shareEvent"
                >
                  <AppLucideIcon name="share" />
                  Share
                </button>
              </div>
              <p class="text-[11px] text-center text-slate-400 leading-snug">
                Paid flows reserve seats for a limited time at checkout. Complete payment before the timer expires.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <RelatedEvents
        :related-events="relatedEvents"
        :loading="relatedLoading"
        :hero-url="getEventImage"
        :format-when="formatEventDateTime"
        :price-label="relatedEventPriceLabel"
      />

      <div
        class="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.08)]"
      >
        <div class="max-w-lg mx-auto space-y-2">
          <CheckoutSummary
            v-if="totalTickets > 0"
            dense
            :lines="linesSelected"
            :types-by-id="typesById"
          />
          <div v-else class="text-center text-xs text-slate-500 py-1">
            Select tickets to see your total
          </div>
          <AppButton
            color="primary"
            block
            class="min-h-12 text-base font-bold"
            :disabled="bookingLoading || totalTickets === 0"
            @click="handleBook"
          >
            {{ bookingLoading ? 'Working…' : ctaLabel }}
          </AppButton>
        </div>
      </div>
    </template>
  </div>
</template>
