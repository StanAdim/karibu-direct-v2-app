<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const config = useRuntimeConfig()
const notifications = useNotifications()
const brand = computed(() => config.public.appName || 'KaribuDirect')

const activeSection = ref<'general' | 'fees' | 'categories' | 'email'>('general')

interface CategoryRow {
  id: string
  name: string
  icon: string
}

const settings = reactive({
  general: {
    platformName: config.public.appName as string,
    supportEmail: 'ops@eventhorizon.com',
    maintenanceMode: false
  },
  fees: {
    mode: 'percent' as 'percent' | 'flat',
    percent: '3.5',
    flat: '1.50'
  }
})

const categories = ref<CategoryRow[]>([
  { id: '1', name: 'Electronic Music', icon: '🎧' },
  { id: '2', name: 'Networking', icon: '🤝' },
  { id: '3', name: 'Workshops', icon: '📚' }
])

const emailTemplates = ref([
  {
    id: 't1',
    title: 'Ticket Confirmation',
    description: 'Sent immediately after a successful ticket purchase.'
  },
  {
    id: 't2',
    title: 'Welcome Email',
    description: 'Onboarding message for new accounts.'
  },
  {
    id: 't3',
    title: 'Event Reminder',
    description: 'Scheduled 24 hours before event start.'
  }
])

const saving = ref(false)
const lastEditAt = ref<Date>(new Date(Date.now() - 14 * 60 * 1000))
const lastEditBy = ref('admin_01')

function serialize(): string {
  return JSON.stringify({
    general: { ...settings.general },
    fees: { ...settings.fees },
    categories: categories.value.map(c => ({ ...c })),
    emailTemplates: emailTemplates.value.map(t => ({ id: t.id, title: t.title, description: t.description }))
  })
}

let baseline = ''

onMounted(() => {
  baseline = serialize()
})

function scrollTo(section: typeof activeSection.value) {
  activeSection.value = section
  document.getElementById(`settings-${section}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function lastEditedLabel(): string {
  return `${formatDistanceToNow(lastEditAt.value, { addSuffix: true })} by @${lastEditBy.value}`
}

function discardChanges() {
  try {
    const b = JSON.parse(baseline) as {
      general: typeof settings.general
      fees: typeof settings.fees
      categories: CategoryRow[]
      emailTemplates: Array<{ id: string; title: string; description: string }>
    }
    Object.assign(settings.general, b.general)
    Object.assign(settings.fees, b.fees)
    categories.value = b.categories.map(c => ({ ...c }))
    emailTemplates.value = b.emailTemplates.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description
    }))
    notifications.info({ title: 'Changes discarded', description: 'Restored last saved configuration.' })
  }
  catch {
    notifications.error({ title: 'Could not discard' })
  }
}

async function saveSettings() {
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 600))
    lastEditAt.value = new Date()
    baseline = serialize()
    notifications.success({ title: 'Settings saved', description: 'Configuration has been updated.' })
  }
  catch {
    notifications.error({ title: 'Save failed' })
  }
  finally {
    saving.value = false
  }
}

function addCategory() {
  categories.value.push({
    id: crypto.randomUUID(),
    name: 'New category',
    icon: '✨'
  })
}

function removeCategory(id: string) {
  categories.value = categories.value.filter(c => c.id !== id)
}

const navItems: { id: typeof activeSection.value; label: string }[] = [
  { id: 'general', label: 'General Settings' },
  { id: 'fees', label: 'Fee Structure' },
  { id: 'categories', label: 'Event Categories' },
  { id: 'email', label: 'Email Templates' }
]
</script>

<template>
  <div class="pb-28">
    <div class="mb-8">
      <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        System settings
      </h1>
      <p class="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
        Configure platform identity, fees, taxonomy, and outbound messaging.
      </p>
    </div>

    <div class="lg:grid lg:grid-cols-[minmax(200px,240px)_1fr] lg:gap-10">
      <!-- Inner nav -->
      <aside class="mb-8 lg:mb-0">
        <nav
          class="flex flex-row gap-2 overflow-x-auto pb-2 lg:flex-col lg:space-y-1 lg:overflow-visible lg:pb-0 lg:sticky lg:top-24"
          aria-label="Settings sections"
        >
          <button
            v-for="item in navItems"
            :key="item.id"
            type="button"
            :class="[
              'whitespace-nowrap rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-colors',
              activeSection === item.id
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            ]"
            @click="scrollTo(item.id)"
          >
            {{ item.label }}
          </button>
        </nav>
      </aside>

      <div class="space-y-8">
        <!-- General -->
        <section
          id="settings-general"
          class="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        >
          <div class="flex items-start gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                General settings
              </h2>
              <p class="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Branding, support contacts, and platform availability.
              </p>
            </div>
          </div>
          <div class="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <label
                for="platform-name"
                class="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >Platform name</label>
              <input
                id="platform-name"
                v-model="settings.general.platformName"
                type="text"
                class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-900 outline-none ring-primary-500/30 focus:border-primary-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                :placeholder="brand"
              >
            </div>
            <div>
              <label
                for="support-email"
                class="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >Support email</label>
              <input
                id="support-email"
                v-model="settings.general.supportEmail"
                type="email"
                class="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-900 outline-none ring-primary-500/30 focus:border-primary-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="ops@example.com"
              >
            </div>
          </div>
          <div class="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/30 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="font-bold text-slate-900 dark:text-white">
                Maintenance mode
              </p>
              <p class="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                Force all non-admin users to a maintenance screen.
              </p>
            </div>
            <label class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer">
              <input
                v-model="settings.general.maintenanceMode"
                type="checkbox"
                class="peer sr-only"
              >
              <span class="absolute inset-0 rounded-full bg-slate-300 transition peer-checked:bg-primary-500 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-400 dark:bg-slate-600" />
              <span class="pointer-events-none absolute left-0.5 top-0.5 z-10 h-6 w-6 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            </label>
          </div>
        </section>

        <!-- Fees -->
        <section
          id="settings-fees"
          class="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        >
          <div class="flex items-start gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
                <path d="M13 5v2" />
                <path d="M13 17v2" />
                <path d="M13 11v2" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                Fee structure
              </h2>
              <p class="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Choose how platform fees are calculated on ticket sales.
              </p>
            </div>
          </div>
          <div class="mt-8 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              :class="[
                'rounded-2xl border-2 p-5 text-left transition',
                settings.fees.mode === 'percent'
                  ? 'border-primary-500 bg-primary-50/50 shadow-md dark:border-primary-500 dark:bg-primary-950/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900'
              ]"
              @click="settings.fees.mode = 'percent'"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-bold text-slate-900 dark:text-white">Percentage fee</span>
                <span
                  v-if="settings.fees.mode === 'percent'"
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span
                  v-else
                  class="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-600"
                />
              </div>
              <p class="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                Deduct a variable portion of each sale. Best for mixed ticket prices.
              </p>
              <div class="mt-4 flex items-center gap-2">
                <input
                  v-model="settings.fees.percent"
                  type="text"
                  inputmode="decimal"
                  class="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-800"
                  @click.stop
                >
                <span class="text-sm font-bold text-slate-600 dark:text-slate-300">%</span>
              </div>
            </button>
            <button
              type="button"
              :class="[
                'rounded-2xl border-2 p-5 text-left transition',
                settings.fees.mode === 'flat'
                  ? 'border-primary-500 bg-primary-50/50 shadow-md dark:border-primary-500 dark:bg-primary-950/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900'
              ]"
              @click="settings.fees.mode = 'flat'"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-bold text-slate-900 dark:text-white">Flat fee</span>
                <span
                  v-if="settings.fees.mode === 'flat'"
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span
                  v-else
                  class="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-600"
                />
              </div>
              <p class="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                Fixed currency amount per transaction, regardless of cart size.
              </p>
              <div class="mt-4 flex items-center gap-2">
                <span class="text-sm font-bold text-slate-600 dark:text-slate-300">$</span>
                <input
                  v-model="settings.fees.flat"
                  type="text"
                  inputmode="decimal"
                  class="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-800"
                  @click.stop
                >
              </div>
            </button>
          </div>
        </section>

        <!-- Categories -->
        <section
          id="settings-categories"
          class="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        >
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="flex items-start gap-4">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect
                    x="3"
                    y="3"
                    width="7"
                    height="7"
                  />
                  <rect
                    x="14"
                    y="3"
                    width="7"
                    height="7"
                  />
                  <rect
                    x="14"
                    y="14"
                    width="7"
                    height="7"
                  />
                  <rect
                    x="3"
                    y="14"
                    width="7"
                    height="7"
                  />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                  Event categories
                </h2>
                <p class="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  Tags organizers can assign when publishing events.
                </p>
              </div>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-bold text-primary-700 dark:border-primary-900 dark:bg-primary-950/30 dark:text-primary-300"
              @click="addCategory"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add new
            </button>
          </div>
          <div class="mt-6 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
            <table class="w-full border-collapse text-left">
              <thead>
                <tr class="bg-slate-50/90 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800/50">
                  <th class="px-4 py-3">
                    Category name
                  </th>
                  <th class="px-4 py-3">
                    Icon
                  </th>
                  <th class="px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(c, i) in categories"
                  :key="c.id"
                  :class="i > 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''"
                >
                  <td class="px-4 py-3">
                    <input
                      v-model="c.name"
                      type="text"
                      class="w-full min-w-[8rem] rounded-lg border border-transparent bg-transparent py-1 text-sm font-bold text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:text-white"
                    >
                  </td>
                  <td class="px-4 py-3">
                    <input
                      v-model="c.icon"
                      type="text"
                      maxlength="4"
                      class="w-16 rounded-lg border border-slate-200 px-2 py-1 text-center text-lg dark:border-slate-700 dark:bg-slate-800"
                    >
                  </td>
                  <td class="px-4 py-3 text-right">
                    <button
                      type="button"
                      class="mr-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit"
                      @click="notifications.info({ title: 'Category', description: 'Inline editing is enabled in the name field.' })"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="inline-flex h-9 w-9 items-center justify-center rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Delete"
                      @click="removeCategory(c.id)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Email -->
        <section
          id="settings-email"
          class="scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        >
          <div class="flex items-start gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path d="m22 6-10 7L2 6" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                Email templates
              </h2>
              <p class="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Transactional messages sent by the platform.
              </p>
            </div>
          </div>
          <ul class="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
            <li
              v-for="tpl in emailTemplates"
              :key="tpl.id"
              class="flex flex-col gap-4 py-5 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="flex items-start gap-3">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 text-slate-600 dark:text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <path d="m22 6-10 7L2 6" />
                  </svg>
                </div>
                <div>
                  <p class="font-bold text-slate-900 dark:text-white">
                    {{ tpl.title }}
                  </p>
                  <p class="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                    {{ tpl.description }}
                  </p>
                </div>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                @click="notifications.info({ title: 'Template editor', description: 'Rich editor integration coming soon.' })"
              >
                Customize
              </button>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <!-- Sticky action bar -->
    <div
      class="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:left-[272px]"
    >
      <div class="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:max-w-none lg:px-6">
        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Last edited {{ lastEditedLabel() }}
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            @click="discardChanges"
          >
            Discard changes
          </button>
          <button
            type="button"
            class="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-500/25 transition hover:bg-primary-600 disabled:opacity-50"
            :disabled="saving"
            @click="saveSettings"
          >
            {{ saving ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
