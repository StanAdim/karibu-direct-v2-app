<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '~/components/ui/AppButton.vue'
import EventCompactStats from '~/components/organizer/events/overview/EventCompactStats.vue'
import EventVenueCard from '~/components/organizer/events/overview/EventVenueCard.vue'
import EventOrganizerCard from '~/components/organizer/events/overview/EventOrganizerCard.vue'
import EventSettingsCard from '~/components/organizer/events/overview/EventSettingsCard.vue'
import EventTicketTypesCompact from '~/components/organizer/events/overview/EventTicketTypesCompact.vue'
import type { OverviewTicketRow } from '~/components/organizer/events/overview/EventTicketTypesCompact.vue'
import type { TicketType as StoreTicketType } from '~/stores/ticket_types'
import type { Event, TicketType as ApiTicketType } from '~/types'
import { getFullName } from '~/types'
import { getEventCoverImageUrl } from '~/utils/eventImage'

const props = withDefaults(
  defineProps<{
    event: Event
    capacityPercentage: number
    /** Fallback when `event.sessions_count` is absent from API payload */
    sessionsCount?: number
    /** Fallback when `event.checkpoints_count` is absent from API payload */
    checkpointsCount?: number
    /** Organizer ticket-type cache (same source as Ticket Types tab); falls back to `event.ticket_types` */
    ticketTypes?: StoreTicketType[] | ApiTicketType[]
  }>(),
  {
    sessionsCount: 0,
    checkpointsCount: 0,
    ticketTypes: undefined
  }
)

const emit = defineEmits<{
  'edit-event': []
}>()

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatTimeRange(start: string, end: string): string {
  const startTime = new Date(start).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
  const endTime = new Date(end).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
  return `${startTime} – ${endTime}`
}

function formatShortDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  catch {
    return iso
  }
}

const venueLabel = computed(() => {
  const venue = props.event.venue
  if (!venue) return 'Venue TBA'
  if (venue.type === 'virtual') return 'Online event'
  return venue.name || venue.city || 'Venue TBA'
})

const config = useRuntimeConfig()

const organizerCheckpointHref = computed(() => `/organizer/checkpoints?event_id=${props.event.id}`)

const primaryCurrency = computed(() =>
  (props.event.ticket_types?.[0]?.currency ?? 'USD').toUpperCase()
)

function formatOrganizerMoney(amount: number): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: primaryCurrency.value }).format(amount)
  }
  catch {
    return `${amount} ${primaryCurrency.value}`
  }
}

function getEventImage(event: Event): string {
  return getEventCoverImageUrl(event.cover_image, String(config.public.apiBase))
}

const sessionsMetric = computed(
  () => props.event.sessions_count ?? props.sessionsCount
)

const checkpointsMetric = computed(
  () => props.event.checkpoints_count ?? props.checkpointsCount
)

const organizerDisplayName = computed(() => {
  const name = props.event.organizer_name?.trim()
  if (name)
    return name
  if (props.event.organizer)
    return getFullName(props.event.organizer) || null
  return null
})

const organizerEmail = computed(() => props.event.organizer?.email ?? null)

const organizerRoleLabel = computed(() => {
  const o = props.event.organizer
  if (!o)
    return null
  return o.primary_role?.name ?? o.roles?.[0] ?? null
})

const categoriesSafe = computed(() => props.event.categories ?? [])

const descriptionBody = computed(() => {
  const d = props.event.description?.trim()
  if (d)
    return d
  return ''
})

const overviewTickets = computed<OverviewTicketRow[]>(() => {
  const list: Array<StoreTicketType | ApiTicketType> = props.ticketTypes?.length
    ? props.ticketTypes
    : (props.event.ticket_types ?? [])
  return list.map((t) => {
    const sold = typeof (t as ApiTicketType).sold_count === 'number'
      ? (t as ApiTicketType).sold_count
      : 0
    return {
      id: String(t.id),
      name: t.name,
      price: Number(t.price),
      currency: t.currency || 'USD',
      quantity: Number(t.quantity),
      sold_count: sold,
      status: String(t.status)
    }
  })
})

const showRevenuePanel = computed(() =>
  props.event.revenue_total !== undefined
  || props.event.order_count !== undefined
  || props.event.average_ticket_price !== undefined
)

const checkInSummary = computed(() => {
  const reg = props.event.registered_count ?? 0
  const ci = props.event.checkin_count ?? 0
  if (!props.event.settings.enable_check_in)
    return null
  return `${ci.toLocaleString()} / ${reg.toLocaleString()} checked in`
})
</script>

<template>
  <div class="space-y-4">
    <!-- Hero -->
    <section
      class="overflow-hidden rounded-xl border border-gray-200/80 bg-surface-container-lowest shadow-sm dark:border-gray-800"
    >
      <div class="relative h-36 sm:h-40 md:h-44">
        <img
          v-if="event.cover_image"
          :src="getEventImage(event)"
          :alt="event.title"
          class="h-full w-full object-cover"
          loading="lazy"
        >
        <div
          v-else
          class="h-full w-full bg-gradient-to-br from-primary-500 via-primary-400 to-sky-500"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 dark:from-black/90 dark:via-black/45" />
        <div class="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div class="min-w-0 flex-1 space-y-1.5">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                <span class="h-1 w-1 rounded-full bg-emerald-400" />
                {{ event.status }}
              </span>
              <span class="rounded-md bg-white/12 px-2 py-0.5 text-[10px] font-medium capitalize text-white/90 backdrop-blur-sm">
                {{ event.visibility }}
              </span>
              <span class="hidden rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-white/85 backdrop-blur-sm sm:inline-flex">
                {{ venueLabel }}
              </span>
            </div>
            <h1 class="font-headline text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl md:text-[1.65rem]">
              {{ event.title }}
            </h1>
            <p class="line-clamp-2 max-w-2xl text-xs leading-snug text-white/80 sm:text-sm">
              {{ event.short_description?.trim() || event.description?.trim() || 'No short description provided.' }}
            </p>
          </div>
          <div class="shrink-0 text-right text-[11px] leading-tight text-white/85">
            <p class="font-semibold text-white">
              {{ formatDate(event.start_date) }}
            </p>
            <p>{{ formatTimeRange(event.start_date, event.end_date) }}</p>
            <p class="mt-0.5 text-[10px] text-white/70">
              {{ event.timezone }}
            </p>
            <AppButton
              size="sm"
              color="neutral"
              icon="edit"
              class="mt-2 !border-white/25 !bg-white/15 !text-white hover:!bg-white/25"
              @click="emit('edit-event')"
            >
              Edit
            </AppButton>
          </div>
        </div>
      </div>
    </section>

    <EventCompactStats
      :registered="event.registered_count ?? 0"
      :capacity="event.capacity ?? 0"
      :capacity-pct="capacityPercentage"
      :sessions="sessionsMetric"
      :checkpoints="checkpointsMetric"
    />

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
      <div class="min-w-0 space-y-4 lg:col-span-8">
        <div class="grid gap-4 md:grid-cols-2">
          <!-- Left column -->
          <div class="space-y-4 md:min-w-0">
            <article class="rounded-xl border border-gray-200/90 bg-surface-container-lowest p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
              <header class="mb-2 flex items-center justify-between gap-2">
                <h3 class="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  Description
                </h3>
                <AppLucideIcon name="i-lucide-align-left" class="h-4 w-4 text-on-surface-variant/70" />
              </header>
              <p class="text-sm leading-relaxed text-on-surface-variant">
                {{ descriptionBody || 'No description provided yet.' }}
              </p>
            </article>

            <article
              v-if="categoriesSafe.length"
              class="rounded-xl border border-gray-200/90 bg-surface-container-lowest p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40"
            >
              <header class="mb-2">
                <h3 class="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  Categories
                </h3>
              </header>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="cat in categoriesSafe"
                  :key="cat"
                  class="rounded-md bg-primary/12 px-2 py-0.5 text-[11px] font-semibold capitalize text-primary"
                >
                  {{ cat?.name }}
                </span>
              </div>
            </article>

            <EventTicketTypesCompact :tickets="overviewTickets" />
          </div>

          <!-- Right column -->
          <div class="space-y-4 md:min-w-0">
            <EventVenueCard
              :venue="event.venue"
              :timezone="event.timezone"
            />
            <EventOrganizerCard
              :organizer-name="organizerDisplayName"
              :email="organizerEmail"
              :role-label="organizerRoleLabel"
            />
            <EventSettingsCard :settings="event.settings" />
          </div>
        </div>
      </div>

      <aside class="min-w-0 space-y-4 lg:col-span-4">
        <section
          v-if="showRevenuePanel"
          class="rounded-xl border border-primary/25 bg-primary p-4 text-on-primary shadow-sm"
        >
          <header class="mb-3 flex items-start justify-between gap-2">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wide text-on-primary/75">
                Revenue
              </p>
              <p class="font-headline text-xl font-bold tabular-nums">
                {{ formatOrganizerMoney(Number(event.revenue_total ?? 0)) }}
              </p>
            </div>
            <AppLucideIcon name="shopping_cart" class="h-4 w-4 text-on-primary/80" />
          </header>
          <dl class="space-y-2 text-[11px] text-on-primary/85">
            <div class="flex justify-between gap-2">
              <dt>Avg. ticket</dt>
              <dd class="font-semibold tabular-nums">
                {{ formatOrganizerMoney(Number(event.average_ticket_price ?? 0)) }}
              </dd>
            </div>
            <div class="flex justify-between gap-2">
              <dt>Orders</dt>
              <dd class="font-semibold tabular-nums">
                {{ (event.order_count ?? 0).toLocaleString() }}
              </dd>
            </div>
          </dl>
        </section>

        <section class="rounded-xl border border-gray-200/90 bg-surface-container-lowest p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
          <header class="mb-3 flex items-center justify-between gap-2">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Status
            </h3>
            <AppLucideIcon name="i-lucide-activity" class="h-4 w-4 text-on-surface-variant/70" />
          </header>
          <dl class="space-y-2 text-xs">
            <div class="flex justify-between gap-2">
              <dt class="text-on-surface-variant">
                State
              </dt>
              <dd class="font-semibold capitalize text-on-surface">
                {{ event.status }}
              </dd>
            </div>
            <div class="flex justify-between gap-2">
              <dt class="text-on-surface-variant">
                Visibility
              </dt>
              <dd class="font-semibold capitalize text-on-surface">
                {{ event.visibility }}
              </dd>
            </div>
            <div class="flex justify-between gap-2">
              <dt class="text-on-surface-variant">
                Registration
              </dt>
              <dd class="font-semibold tabular-nums text-on-surface">
                {{ (event.registered_count ?? 0).toLocaleString() }} / {{ (event.capacity ?? 0).toLocaleString() }}
              </dd>
            </div>
            <div
              v-if="checkInSummary"
              class="flex justify-between gap-2"
            >
              <dt class="text-on-surface-variant">
                Check-in
              </dt>
              <dd class="font-semibold tabular-nums text-on-surface">
                {{ checkInSummary }}
              </dd>
            </div>
          </dl>
          <p class="mt-3 border-t border-gray-100 pt-3 text-[10px] leading-relaxed text-on-surface-variant dark:border-gray-800">
            Created {{ formatShortDateTime(event.created_at) }}
            · Updated {{ formatShortDateTime(event.updated_at) }}
          </p>
        </section>

        <section class="rounded-xl border border-gray-200/90 bg-surface-container-lowest p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
          <header class="mb-3">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Quick actions
            </h3>
          </header>
          <div class="flex flex-col gap-2">
            <AppButton
              block
              size="sm"
              color="neutral"
              icon="edit"
              @click="emit('edit-event')"
            >
              Edit event
            </AppButton>
            <AppButton
              block
              size="sm"
              color="neutral"
              icon="group"
              :to="`/organizer/events/${event.id}?tab=attendees`"
            >
              View attendees
            </AppButton>
            <AppButton
              block
              size="sm"
              icon="qr_code_scanner"
              :to="organizerCheckpointHref"
            >
              Open check-ins
            </AppButton>
            <AppButton
              block
              size="sm"
              color="neutral"
              icon="link"
              :to="`/events/${event.slug}`"
              target="_blank"
            >
              View public event
            </AppButton>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>
