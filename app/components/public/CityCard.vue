<script setup lang="ts">
interface Props {
  name: string
  image: string
  eventCount?: number
}

defineProps<Props>()

defineEmits<{
  click: [name: string]
}>()
</script>

<template>
  <div
    class="group relative cursor-pointer overflow-hidden rounded-2xl"
    @click="$emit('click', name)"
  >
    <!-- Image -->
    <div class="aspect-square overflow-hidden">
      <img
        :src="image"
        :alt="name"
        class="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
    </div>

    <!-- Overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

    <!-- Content -->
    <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
      <h4 class="font-bold text-lg">{{ name }}</h4>
      <p v-if="eventCount" class="text-sm text-white/80">{{ eventCount }} events</p>
    </div>
  </div>
</template>
