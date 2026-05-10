<script setup lang="ts">
interface Props {
  id: string | number
  title: string
  image: string
  date: string
  location: string
  price: string | number
  category?: string
  attendees?: string | number
  isFavorite?: boolean
  /** Show the heart affordance (hidden when false). Default true. */
  showFavorite?: boolean
}

withDefaults(defineProps<Props>(), {
  showFavorite: true,
})

const emit = defineEmits<{
  click: [id: string | number]
  favorite: [id: string | number]
}>()

function formatPrice(price: string | number): string {
  if (price === 'Free' || price === 0) return 'Free'
  if (typeof price === 'number') return `TZS ${price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  return String(price)
}
</script>

<template>
  <article
    class="group/card relative cursor-pointer overflow-hidden rounded-[var(--radius-public-card)]
      border border-slate-200/80 bg-white/95 shadow-[var(--shadow-public-card)] backdrop-blur-sm
      transition-[var(--transition-public-surface)]
      hover:-translate-y-1 hover:border-primary-200 hover:shadow-[var(--shadow-public-card-hover)]
      dark:border-slate-800/90 dark:bg-slate-900/95 dark:hover:border-primary-500/30"
    role="button"
    tabindex="0"
    @click="emit('click', id)"
    @keydown.enter.prevent="emit('click', id)"
    @keydown.space.prevent="emit('click', id)"
  >
    <div class="relative aspect-[4/3] w-full overflow-hidden">
      <img
        :src="image"
        :alt="title"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.06]"
      >
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/10 opacity-80 mix-blend-multiply dark:opacity-70"
        aria-hidden="true"
      />

      <div
        class="absolute left-3 top-3 z-[1] flex min-h-[3.5rem] min-w-[3.5rem] flex-col items-center justify-center rounded-2xl bg-white/95 px-2 py-1.5 text-center shadow-lg shadow-slate-900/15 ring-1 ring-black/5 backdrop-blur-md dark:bg-slate-900/95 dark:ring-white/10"
      >
        <span class="text-[10px] font-bold uppercase leading-none text-primary-600 dark:text-primary-400">
          {{ String(date).split(' ')[0] ?? '' }}
        </span>
        <span class="mt-0.5 text-base font-bold tabular-nums leading-none text-slate-900 dark:text-white">
          {{ String(date).split(' ').slice(1).join(' ') || date }}
        </span>
      </div>

      <button
        v-if="showFavorite"
        type="button"
        class="public-focus-ring absolute right-3 top-3 z-[1] rounded-full bg-white/90 p-2.5 shadow-lg shadow-slate-900/10 backdrop-blur-md transition hover:scale-105 hover:bg-white active:scale-95 dark:bg-slate-900/90"
        :class="isFavorite ? 'text-primary-500' : 'text-slate-400 hover:text-primary-500'"
        :aria-pressed="isFavorite"
        aria-label="Save event"
        @click.stop="emit('favorite', id)"
      >
        <AppLucideIcon name="favorite" class="text-lg" />
      </button>
    </div>

    <div class="flex flex-col gap-2 p-5">
      <div
        v-if="category"
        class="text-[11px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400"
      >
        {{ category }}
      </div>

      <h3 class="text-lg font-bold leading-snug tracking-tight text-slate-900 transition-colors line-clamp-2 group-hover/card:text-primary-600 dark:text-white dark:group-hover/card:text-primary-400">
        {{ title }}
      </h3>

      <div class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
        <AppLucideIcon name="location_on" class="mt-0.5 shrink-0 text-base text-primary-500/70" aria-hidden="true" />
        <span class="line-clamp-2">{{ location }}</span>
      </div>

      <div class="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        <span
          class="text-sm font-bold"
          :class="formatPrice(price) === 'Free' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-900 dark:text-slate-100'"
        >
          {{ formatPrice(price) }}
        </span>
        <span v-if="attendees" class="text-xs font-medium text-slate-400">{{ attendees }} attending</span>
      </div>
    </div>
  </article>
</template>
