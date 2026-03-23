<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import type { EventCategory } from '~/types'
import { useApi } from '~/composables/useApi'

const model = defineModel<string[]>({ default: () => [] })

withDefaults(
  defineProps<{
    label?: string
    hint?: string
    error?: string
    disabled?: boolean
  }>(),
  {
    label: 'Categories',
    hint: undefined,
    error: undefined,
    disabled: false
  }
)

const api = useApi()
const open = ref(false)
const loading = ref(false)
const loadFailed = ref(false)
const categories = ref<EventCategory[]>([])
const root = ref<HTMLElement | null>(null)

onClickOutside(root, () => {
  open.value = false
})

function normalizeItems(list: unknown[]): EventCategory[] {
  const out: EventCategory[] = []
  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const id = o.id != null ? String(o.id) : o.slug != null ? String(o.slug) : ''
    if (!id) continue
    const nameRaw = o.name ?? o.title ?? o.label ?? id
    out.push({ id, name: String(nameRaw) })
  }
  return out
}

function unwrapList(raw: unknown): EventCategory[] {
  if (Array.isArray(raw)) return normalizeItems(raw)
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    if (Array.isArray(o.data)) return normalizeItems(o.data)
    if (Array.isArray(o.results)) return normalizeItems(o.results)
  }
  return []
}

async function fetchCategories() {
  loading.value = true
  loadFailed.value = false
  try {
    const raw = await api.get<unknown>('/events/categories/', { suppressErrorToast: true })
    categories.value = unwrapList(raw)
  }
  catch {
    loadFailed.value = true
    categories.value = []
  }
  finally {
    loading.value = false
  }
}

onMounted(fetchCategories)

function isSelected(id: string) {
  return model.value.includes(id)
}

function toggle(id: string) {
  const next = [...model.value]
  const i = next.indexOf(id)
  if (i === -1) next.push(id)
  else next.splice(i, 1)
  model.value = next
}

function remove(id: string) {
  model.value = model.value.filter(x => x !== id)
}

const labelById = computed(() => {
  const m = new Map<string, string>()
  for (const c of categories.value) m.set(c.id, c.name)
  return m
})

const summary = computed(() => {
  const n = model.value.length
  if (n === 0) return 'Select categories'
  if (n === 1) return '1 category selected'
  return `${n} categories selected`
})
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
      {{ label }}
    </label>
    <p
      v-if="hint"
      class="text-xs text-slate-500 dark:text-slate-400 ml-1 -mt-0.5"
    >
      {{ hint }}
    </p>

    <div
      ref="root"
      class="relative"
    >
      <button
        type="button"
        class="flex w-full min-h-11 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-900 transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600"
        :disabled="disabled || loading"
        :class="error ? 'border-red-500 dark:border-red-500' : ''"
        @click="open = !open"
      >
        <span :class="model.length ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'">
          {{ loading ? 'Loading categories…' : summary }}
        </span>
        <UIcon
          name="i-lucide-chevron-down"
          class="h-4 w-4 shrink-0 text-slate-400 transition-transform"
          :class="{ 'rotate-180': open }"
        />
      </button>

      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div
          v-if="open && !loading"
          class="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          <p
            v-if="loadFailed"
            class="px-3 py-2 text-xs text-red-600 dark:text-red-400"
          >
            Could not load categories.
          </p>
          <p
            v-else-if="categories.length === 0"
            class="px-3 py-2 text-xs text-slate-500 dark:text-slate-400"
          >
            No categories available.
          </p>
          <label
            v-for="cat in categories"
            :key="cat.id"
            class="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-700/80"
          >
            <input
              type="checkbox"
              class="rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600"
              :checked="isSelected(cat.id)"
              @change="toggle(cat.id)"
            >
            <span>{{ cat.name }}</span>
          </label>
        </div>
      </Transition>
    </div>

    <div
      v-if="model.length > 0"
      class="flex flex-wrap gap-1.5 ml-0.5"
    >
      <span
        v-for="id in model"
        :key="id"
        class="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-950 dark:text-primary-200"
      >
        {{ labelById.get(id) ?? id }}
        <button
          type="button"
          class="rounded p-0.5 hover:bg-primary-100 dark:hover:bg-primary-900"
          :disabled="disabled"
          aria-label="Remove"
          @click="remove(id)"
        >
          <UIcon
            name="i-lucide-x"
            class="h-3 w-3"
          />
        </button>
      </span>
    </div>

    <p
      v-if="error"
      class="text-xs text-red-500 ml-1"
    >
      {{ error }}
    </p>
  </div>
</template>
