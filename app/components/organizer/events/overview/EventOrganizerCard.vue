<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  organizerName: string | null
  email: string | null
  roleLabel: string | null
}>()

const initials = computed(() => {
  const n = props.organizerName
  if (!n?.trim())
    return '?'
  const parts = n.trim().split(/\s+/)
  const a = parts[0]?.[0]
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1]
  return `${a ?? ''}${b ?? ''}`.toUpperCase() || '?'
})
</script>

<template>
  <article class="rounded-xl border border-gray-200/90 bg-surface-container-lowest p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40">
    <header class="mb-3 flex items-center justify-between gap-2">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
        Organizer
      </h3>
      <AppLucideIcon name="i-lucide-user" class="h-4 w-4 text-on-surface-variant/70" />
    </header>

    <div class="flex gap-3">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary"
        aria-hidden="true"
      >
        {{ initials }}
      </div>
      <dl class="min-w-0 flex-1 space-y-1.5 text-sm">
        <div>
          <dt class="sr-only">
            Name
          </dt>
          <dd class="truncate font-semibold text-on-surface">
            {{ organizerName || '—' }}
          </dd>
        </div>
        <div v-if="email">
          <dt class="sr-only">
            Email
          </dt>
          <dd class="truncate text-xs text-on-surface-variant">
            {{ email }}
          </dd>
        </div>
        <div>
          <dt class="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
            Role
          </dt>
          <dd class="text-xs font-medium text-on-surface">
            {{ roleLabel || '—' }}
          </dd>
        </div>
      </dl>
    </div>
  </article>
</template>
