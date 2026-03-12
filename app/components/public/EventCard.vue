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
  if (typeof price === 'number') {
    return `$${price.toFixed(2)}`
  }
  return price
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

      <!-- Favorite Button -->
      <button
        class="absolute right-4 top-4 rounded-full bg-white/90 backdrop-blur-sm p-2 shadow-lg cursor-pointer hover:bg-white transition-colors"
        :class="isFavorite ? 'text-primary-500' : 'text-slate-400 hover:text-primary-500'"
        @click.stop="emit('favorite', id)"
      >
        <span class="material-symbols-outlined font-bold">favorite</span>
      </button>

      <!-- Category Badge -->
      <div
        v-if="category"
        class="absolute left-4 bottom-4 rounded-lg bg-primary-500/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-white uppercase"
      >
        {{ category }}
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-col p-5 gap-3">
      <!-- Date and Price -->
      <div class="flex items-center justify-between text-xs font-bold text-primary-500">
        <span class="uppercase tracking-widest">{{ date }}</span>
        <span>{{ formatPrice(price) }}</span>
      </div>

      <!-- Title -->
      <h3 class="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-500 transition-colors">
        {{ title }}
      </h3>

      <!-- Location -->
      <div class="flex items-center gap-1.5 text-sm text-slate-500">
        <span class="material-symbols-outlined text-sm">location_on</span>
        <span>{{ location }}</span>
      </div>

      <!-- Attendees -->
      <div v-if="attendees" class="flex items-center justify-end">
        <span class="text-xs text-slate-400">{{ attendees }} attending</span>
      </div>
    </div>
  </div>
</template>
