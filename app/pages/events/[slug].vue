<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { EventVenue } from '~/types'
import { getEventCoverImageUrl } from '~/utils/eventImage'

declare const definePageMeta: (meta: Record<string, unknown>) => void

definePageMeta({
  layout: 'public'
})

interface PublicEventDetailEnvelope {
  success?: boolean
  data?: PublicEventDetailPayload
}

interface PublicEventDetailPayload {
  id: string
  title: string
  slug: string
  short_description?: string
  description: string
  cover_image?: string
  start_date: string
  end_date: string
  timezone: string
  venue: EventVenue
}

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const slugParam = computed(() => String(route.params.slug ?? '').trim())

const pending = ref(true)
const event = ref<PublicEventDetailPayload | null>(null)
const fetchError = ref(false)

async function load(): Promise<void> {
  if (!slugParam.value) {
    await router.replace('/events')
    return
  }
  pending.value = true
  fetchError.value = false
  event.value = null
  try {
    const raw = await $fetch<PublicEventDetailEnvelope>(
      `/events/slug/${encodeURIComponent(slugParam.value)}`,
      { baseURL: String(config.public.apiBase ?? '') }
    )
    const data = raw?.data ?? null
    event.value = data
    fetchError.value = !data
  }
  catch {
    fetchError.value = true
    event.value = null
  }
  finally {
    pending.value = false
  }
}

watch(slugParam, () => void load())

onMounted(load)

function venueLine(ev: PublicEventDetailPayload): string {
  const v = ev.venue
  if (!v) return '—'
  if (v.type === 'virtual') return 'Online'
  const parts = [v.name, v.city].filter(Boolean)
  return parts.length ? parts.join(', ') : '—'
}

const heroImage = computed(() => {
  const ev = event.value
  if (!ev) return ''
  return getEventCoverImageUrl(
    ev.cover_image,
    String(config.public.apiBase ?? ''),
    `https://picsum.photos/seed/browse-${ev.id}/1400/800`
  )
})
</script>

<template>
  <div class="public-page-bg min-h-[60vh]">
    <div v-if="pending" class="public-container flex justify-center py-24">
      <LoadingState text="Loading event…" />
    </div>
    <div
      v-else-if="fetchError || !event"
      class="public-container max-w-4xl py-24 text-center"
    >
      <p class="text-lg font-semibold text-slate-800 dark:text-slate-100">
        We couldn&apos;t find this event.
      </p>
      <p class="mt-2 text-slate-500 dark:text-slate-400">
        It may no longer be public or the link might be outdated.
      </p>
      <NuxtLink
        to="/events"
        class="public-focus-ring mt-8 inline-flex min-h-11 items-center rounded-2xl bg-primary-500 px-6 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition hover:bg-primary-600"
      >
        Browse events
      </NuxtLink>
    </div>
    <article v-else class="public-container max-w-4xl py-10 sm:py-14">
      <div class="overflow-hidden rounded-[var(--radius-public-hero)] bg-slate-950 shadow-[var(--shadow-public-float)] ring-1 ring-white/10 dark:ring-white/10">
        <div class="relative aspect-[21/9] min-h-[220px]">
          <img
            :src="heroImage"
            :alt="event.title"
            class="h-full w-full object-cover"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-primary-900/25" />
          <div class="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-transparent" />
          <div class="absolute bottom-0 left-0 right-0 space-y-3 p-6 md:p-10">
            <h1 class="text-balance text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[2.5rem]">
              {{ event.title }}
            </h1>
            <p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-white/90">
              <AppLucideIcon name="schedule" class="text-[18px] shrink-0" aria-hidden="true" />
              <span>{{ new Date(event.start_date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }) }}</span>
              <span class="text-white/50" aria-hidden="true">·</span>
              <span>{{ new Date(event.start_date).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              }) }}</span>
            </p>
            <p class="flex flex-wrap items-center gap-2 text-sm text-white/85">
              <AppLucideIcon name="location_on" class="text-[18px] shrink-0" aria-hidden="true" />
              <span>{{ venueLine(event) }}</span>
            </p>
          </div>
        </div>
      </div>

      <div class="mt-8 public-card-surface p-6 md:p-10">
        <p v-if="event.short_description" class="text-lg leading-relaxed text-slate-700 dark:text-slate-200">
          {{ event.short_description }}
        </p>
        <div
          class="mt-6 whitespace-pre-line border-t border-slate-100 pt-6 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300"
        >
          {{ event.description }}
        </div>
      </div>
    </article>
  </div>
</template>
