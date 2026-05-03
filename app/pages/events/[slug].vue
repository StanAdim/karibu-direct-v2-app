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
  <div class="bg-slate-50 dark:bg-slate-950 min-h-[60vh]">
    <div v-if="pending" class="mx-auto flex max-w-4xl justify-center px-4 py-20">
      <LoadingState text="Loading event…" />
    </div>
    <div
      v-else-if="fetchError || !event"
      class="mx-auto max-w-4xl px-4 py-20 text-center"
    >
      <p class="text-lg font-semibold text-slate-800 dark:text-slate-100">
        We couldn&apos;t find this event.
      </p>
      <p class="mt-2 text-slate-500 dark:text-slate-400">
        It may no longer be public or the link might be outdated.
      </p>
      <NuxtLink
        to="/events"
        class="mt-8 inline-flex rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-600"
      >
        Browse events
      </NuxtLink>
    </div>
    <article v-else class="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
      <div class="mb-6 overflow-hidden rounded-3xl bg-slate-900 shadow-lg">
        <div class="relative aspect-[21/9] min-h-[200px]">
          <img
            :src="heroImage"
            :alt="event.title"
            class="h-full w-full object-cover opacity-90"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
          <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h1 class="text-3xl font-black text-white md:text-4xl">
              {{ event.title }}
            </h1>
            <p class="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/85">
              <AppLucideIcon name="schedule" class="text-[18px]" />
              <span>{{ new Date(event.start_date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }) }}</span>
              <span class="text-white/70">·</span>
              <span>{{ new Date(event.start_date).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              }) }}</span>
            </p>
            <p class="mt-1 flex flex-wrap items-center gap-3 text-sm text-white/85">
              <AppLucideIcon name="location_on" class="text-[18px]" />
              <span>{{ venueLine(event) }}</span>
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-primary-50 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
        <p v-if="event.short_description" class="text-lg text-slate-600 dark:text-slate-300">
          {{ event.short_description }}
        </p>
        <div class="mt-6 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {{ event.description }}
        </div>
      </div>
    </article>
  </div>
</template>
