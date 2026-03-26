<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import AppButton from '~/components/ui/AppButton.vue'
import ConfirmModal from '~/components/common/ConfirmModal.vue'
import type { TicketType } from '~/stores/ticket_types'

const props = withDefaults(
  defineProps<{
    eventId: string
    ticketTypes: TicketType[]
    loading?: boolean
  }>(),
  { loading: false }
)

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'edit', ticketType: TicketType): void
  (e: 'clone', ticketType: TicketType): void
  (e: 'delete', ticketType: TicketType): void
  (e: 'refresh'): void
}>()

const searchQuery = ref('')
const showDeleted = ref(false)
const openMenuId = ref<string | null>(null)

const confirmDeleteOpen = ref(false)
const deletingTarget = ref<TicketType | null>(null)

function closeMenus() {
  openMenuId.value = null
}

function onDocumentClick(e: MouseEvent) {
  const el = e.target as HTMLElement
  if (!el.closest('[data-ticket-type-menu-root]')) {
    closeMenus()
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))

watch(
  () => props.eventId,
  () => {
    searchQuery.value = ''
    showDeleted.value = false
    closeMenus()
  }
)

const visibleTicketTypes = computed(() => {
  const list = props.ticketTypes
  return showDeleted.value ? list : list.filter(t => !t.deleted_at)
})

const filteredTicketTypes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return visibleTicketTypes.value
  return visibleTicketTypes.value.filter(t =>
    t.name.toLowerCase().includes(q)
    || (t.description?.toLowerCase().includes(q) ?? false)
    || t.currency.toLowerCase().includes(q)
    || String(t.price).includes(q)
  )
})

const activeCount = computed(() => props.ticketTypes.filter(t => !t.deleted_at).length)
const deletedCount = computed(() => props.ticketTypes.filter(t => Boolean(t.deleted_at)).length)

function formatMoney(price: number, currency: string): string {
  const value = Number.isFinite(price) ? price : 0
  const cur = currency || 'USD'
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(value)
  } catch {
    return `${value} ${cur}`
  }
}

function formatWindow(start?: string | null, end?: string | null): string {
  const parts: string[] = []
  if (start) parts.push(new Date(start).toLocaleString())
  if (end) parts.push(new Date(end).toLocaleString())
  if (!parts.length) return 'Always'
  return parts.join(' → ')
}

function statusPillClass(t: TicketType): string {
  if (t.deleted_at) return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
  if (t.status === 'available') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
  if (t.status === 'sold_out') return 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
  if (t.status === 'hidden') return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
  return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200'
}

function openDeleteConfirm(t: TicketType) {
  deletingTarget.value = t
  confirmDeleteOpen.value = true
  closeMenus()
}

function confirmDelete() {
  if (!deletingTarget.value) return
  emit('delete', deletingTarget.value)
  confirmDeleteOpen.value = false
  deletingTarget.value = null
}
</script>

<template>
  <div class="space-y-10 text-[#0a1120] dark:text-slate-100">
    <!-- Hero -->
    <section class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-2xl space-y-1">
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-500">
          Monetization
        </p>
        <h2 class="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl sm:leading-none">
          Ticket Types <span class="text-primary-500/40">Management</span>
        </h2>
        <p class="mt-3 max-w-lg text-base leading-relaxed text-slate-600 dark:text-slate-400">
          Create ticket categories, set prices, define sales windows, and enforce purchase limits.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <AppButton
          color="neutral"
          size="sm"
          icon="refresh"
          class="!shadow-sm !bg-white !text-slate-800 border border-slate-200/80 hover:!bg-[#e8efff]/80 dark:!bg-slate-900 dark:border-slate-700 dark:!text-slate-100"
          :disabled="props.loading"
          @click="emit('refresh')"
        >
          Refresh
        </AppButton>
        <AppButton
          icon="add"
          class="shrink-0 self-start !px-8 !py-3.5 !text-sm !font-bold !shadow-xl !shadow-primary-500/30 lg:self-auto"
          @click="emit('add')"
        >
          Add Ticket Type
        </AppButton>
      </div>
    </section>

    <!-- Toolbar -->
    <section class="grid gap-4 lg:grid-cols-[1fr,auto] lg:items-center">
      <div class="relative max-w-xl">
        <span class="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">
          search
        </span>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search ticket types, currency, or price..."
          class="w-full rounded-full border-0 bg-[#e8efff]/90 py-2.5 pl-12 pr-4 text-sm text-slate-900 shadow-inner outline-none ring-1 ring-slate-200/60 placeholder:text-slate-500/70 focus:ring-2 focus:ring-primary-500/20 dark:bg-slate-800/90 dark:text-white dark:ring-slate-700 dark:placeholder:text-slate-500"
          autocomplete="off"
        >
      </div>

      <div class="flex flex-wrap items-center gap-3 text-xs">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          @click="showDeleted = !showDeleted"
        >
          <span class="material-symbols-outlined text-base">
            {{ showDeleted ? 'visibility' : 'visibility_off' }}
          </span>
          {{ showDeleted ? 'Showing deleted' : 'Hide deleted' }}
          <span
            v-if="deletedCount"
            class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {{ deletedCount }}
          </span>
        </button>

        <span class="rounded-full bg-primary-500/10 px-3 py-2 font-bold text-primary-700 dark:text-primary-300">
          Active: {{ activeCount }}
        </span>
      </div>
    </section>

    <div
      v-if="props.loading"
      class="py-12"
    >
      <LoadingState text="Loading ticket types..." />
    </div>

    <template v-else>
      <EmptyState
        v-if="!filteredTicketTypes.length"
        icon="i-lucide-ticket"
        title="No ticket types yet"
        description="Add your first ticket type to start selling tickets."
      >
        <template #actions>
          <AppButton icon="add" @click="emit('add')">
            Add Ticket Type
          </AppButton>
        </template>
      </EmptyState>

      <section
        v-else
        class="space-y-3"
      >
        <article
          v-for="t in filteredTicketTypes"
          :key="t.id"
          class="group rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-xl shadow-primary-500/5 transition hover:shadow-primary-500/10 dark:border-slate-800 dark:bg-slate-900"
        >
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0 space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="truncate text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {{ t.name }}
                </h3>
                <span
                  class="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                  :class="statusPillClass(t)"
                >
                  {{ t.deleted_at ? 'Deleted' : t.status }}
                </span>
              </div>

              <p
                v-if="t.description"
                class="text-sm leading-relaxed text-slate-600 dark:text-slate-400"
              >
                {{ t.description }}
              </p>

              <div class="flex flex-wrap gap-2 text-xs">
                <span class="inline-flex items-center gap-2 rounded-full bg-[#e8efff]/80 px-3 py-1.5 font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                  <span class="material-symbols-outlined text-base text-primary-600 dark:text-primary-300">paid</span>
                  {{ formatMoney(t.price, t.currency) }}
                </span>
                <span class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                  <span class="material-symbols-outlined text-base text-slate-500">inventory_2</span>
                  Qty: {{ (t.quantity ?? 0).toLocaleString() }}
                </span>
                <span class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                  <span class="material-symbols-outlined text-base text-slate-500">shopping_cart</span>
                  Max/order: {{ t.max_per_order ?? 10 }}
                </span>
                <span class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <span class="material-symbols-outlined text-base text-slate-500">schedule</span>
                  {{ formatWindow(t.sales_start, t.sales_end) }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2 lg:justify-end">
              <AppButton
                color="neutral"
                size="sm"
                icon="edit"
                class="!shadow-sm !bg-white !text-slate-800 border border-slate-200/80 hover:!bg-[#e8efff]/80 dark:!bg-slate-900 dark:border-slate-700 dark:!text-slate-100"
                :disabled="Boolean(t.deleted_at)"
                @click="emit('edit', t)"
              >
                Edit
              </AppButton>

              <div
                class="relative"
                data-ticket-type-menu-root
              >
                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  @click="openMenuId = openMenuId === t.id ? null : t.id"
                >
                  <span class="material-symbols-outlined text-[20px]">
                    more_vert
                  </span>
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
                    v-if="openMenuId === t.id"
                    class="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
                  >
                    <button
                      type="button"
                      class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
                      @click="() => { emit('clone', t); closeMenus() }"
                    >
                      <span class="material-symbols-outlined text-base text-slate-500">content_copy</span>
                      Clone
                    </button>
                    <button
                      type="button"
                      class="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      :disabled="Boolean(t.deleted_at)"
                      @click="openDeleteConfirm(t)"
                    >
                      <span class="material-symbols-outlined text-base">delete</span>
                      Delete
                    </button>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </article>
      </section>
    </template>

    <ConfirmModal
      :open="confirmDeleteOpen"
      title="Delete ticket type?"
      :message="`This will soft-delete “${deletingTarget?.name ?? ''}”. You can still show deleted items in this tab.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      :loading="false"
      @update:open="(v) => { confirmDeleteOpen = v }"
      @confirm="confirmDelete"
      @cancel="() => { confirmDeleteOpen = false; deletingTarget = null }"
    />
  </div>
</template>

