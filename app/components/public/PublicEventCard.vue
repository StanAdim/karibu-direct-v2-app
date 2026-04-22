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
}

defineProps<Props>()

const emit = defineEmits<{
  click: [id: string | number]
  favorite: [id: string | number]
}>()

function formatPrice(price: string | number): string {
  if (price === 'Free' || price === 0) return 'Free'
  if (typeof price === 'number') return `TZS ${price.toFixed(2)}`
  return String(price)
}
</script>

<template>
  <div
    class="group cursor-pointer rounded-2xl bg-white dark:bg-slate-900 border border-primary-500/5 shadow-sm hover:shadow-xl hover:shadow-primary-500/5 transition-all overflow-hidden"
    @click="emit('click', id)"
  >
    <!-- Image Container -->
    <div class="relative aspect-[16/10] w-full overflow-hidden">
      <img
        :src="image"
        :alt="title"
        class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      <!-- Date: purple circle top-left -->
      <div class="absolute left-4 top-4 flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white text-xs font-bold uppercase leading-tight shadow-md">
        {{ date }}
      </div>

      <!-- Favorite Button top-right -->
      <button
        class="absolute right-4 top-4 rounded-full bg-white/90 backdrop-blur-sm p-2 shadow-lg cursor-pointer hover:bg-white transition-colors"
        :class="isFavorite ? 'text-primary-500' : 'text-slate-400 hover:text-primary-500'"
        @click.stop="emit('favorite', id)"
      >
        <span class="material-symbols-outlined font-bold text-lg">favorite</span>
      </button>

      <!-- Category: small tag below image (optional, design has it below image) -->
    </div>

    <!-- Content -->
    <div class="flex flex-col p-5 gap-2">
      <div v-if="category" class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {{ category }}
      </div>

      <!-- Title -->
      <h3 class="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-500 transition-colors">
        {{ title }}
      </h3>

      <!-- Location -->
      <div class="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        <span class="material-symbols-outlined text-sm shrink-0">location_on</span>
        <span class="line-clamp-1">{{ location }}</span>
      </div>

      <!-- Price + Attendees -->
      <div class="flex items-center justify-between mt-1">
        <span
          class="text-sm font-semibold"
          :class="formatPrice(price) === 'Free' ? 'text-primary-500' : 'text-slate-700 dark:text-slate-300'"
        >
          {{ formatPrice(price) }}
        </span>
        <span v-if="attendees" class="text-xs text-slate-400">{{ attendees }} attending</span>
      </div>
    </div>
  </div>
</template>
