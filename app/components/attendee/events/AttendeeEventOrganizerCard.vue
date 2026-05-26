<script setup lang="ts">
import { computed } from 'vue'
import type { Event } from '~/types'
import { getFullName } from '~/types'

interface Props {
  event: Event
}

const props = defineProps<Props>()

const organizerLine = computed(() => {
  const o = props.event.organizer
  if (!o) return null
  return {
    name: getFullName(o),
    avatar: o.avatar,
    email: o.email,
  }
})
</script>

<template>
  <div
    v-if="organizerLine"
    class="card card-pad flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
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
          {{ event.settings?.show_attendee_count ? `${event.registered_count} attending` : 'Verified organizer' }}
        </p>
      </div>
    </div>
    <div class="flex gap-3 shrink-0">
      <a
        v-if="organizerLine.email"
        :href="`mailto:${organizerLine.email}?subject=${encodeURIComponent('Question about: ' + event.title)}`"
        class="btn-outline px-5 py-2 text-sm inline-flex items-center gap-2"
      >
        <AppLucideIcon name="mail" class="text-base" />
        Contact
      </a>
    </div>
  </div>
</template>
