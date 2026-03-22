<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { computed, ref } from 'vue'

type MenuItem = {
  label: string
  icon?: string
  to?: string
  click?: () => void
  disabled?: boolean
  slot?: string
  type?: 'label'
}

interface Props {
  items: MenuItem[][]
  avatarAlt: string
  avatarSrc?: string | null
  /**
   * Optional subtitle or role to show in the mobile modal header
   */
  subtitle?: string
  /**
   * User email or primary identifier shown under "ACCOUNT" in the modal
   */
  userEmail?: string | null
}

const props = defineProps<Props>()

const isMobileModalOpen = ref(false)
const desktopOpen = ref(false)
const desktopWrap = ref<HTMLElement | null>(null)

onClickOutside(desktopWrap, () => {
  desktopOpen.value = false
})

/** Flatten to only actionable items (no account/label row) for the modal list */
const modalMenuItems = computed(() => {
  const list: MenuItem[] = []
  for (const group of props.items) {
    for (const item of group) {
      if (item.slot === 'account' || item.type === 'label' || item.disabled) continue
      list.push(item)
    }
  }
  return list
})

function isSignOutItem(item: MenuItem): boolean {
  const t = item.label.toLowerCase()
  return t === 'sign out' || t === 'logout' || (!!item.click && (t.includes('sign out') || t.includes('logout')))
}

function handleItemClick(item: MenuItem) {
  if (item.disabled) return
  if (item.click) item.click()
  isMobileModalOpen.value = false
  desktopOpen.value = false
}
</script>

<template>
  <div class="mt-2 flex items-center">
    <!-- Desktop: avatar trigger + dropdown -->
    <div
      ref="desktopWrap"
      class="relative hidden sm:block"
    >
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border border-transparent px-1.5 py-1.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-haspopup="true"
        :aria-expanded="desktopOpen"
        @click.stop="desktopOpen = !desktopOpen"
      >
        <AppAvatar
          :src="avatarSrc"
          :alt="avatarAlt"
          size="xs"
          class="border border-slate-200 dark:border-slate-700"
        />
        <AppLucideIcon
          name="i-lucide-chevron-down"
          :size="16"
          class="text-slate-500 dark:text-slate-400"
        />
      </button>

      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-show="desktopOpen"
          class="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800"
          role="menu"
        >
          <div class="px-5 pb-4 pt-5">
            <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
              Account
            </p>
            <p class="mt-1 truncate text-base font-bold text-slate-900 dark:text-white">
              {{ userEmail ?? items[0]?.[0]?.label ?? avatarAlt }}
            </p>
            <p
              v-if="subtitle"
              class="mt-0.5 text-xs text-slate-500 dark:text-slate-400"
            >
              {{ subtitle }}
            </p>
          </div>

          <div class="h-px bg-slate-100 dark:bg-slate-800" />

          <nav class="py-2">
            <component
              :is="item.to ? 'NuxtLink' : 'button'"
              v-for="(item, index) in modalMenuItems"
              :key="index"
              :to="item.to"
              v-bind="item.to ? {} : { type: 'button' }"
              class="flex w-full items-center gap-3 px-5 py-2.5 text-left text-[15px] transition-colors"
              :class="[
                isSignOutItem(item)
                  ? 'mt-1 border-t border-slate-100 text-red-600 hover:bg-red-50 dark:border-slate-800/80 dark:text-red-400 dark:hover:bg-red-950/40'
                  : 'text-slate-900 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800/80'
              ]"
              @click="handleItemClick(item)"
            >
              <AppLucideIcon
                v-if="item.icon"
                :name="item.icon"
                :size="20"
                :class="[
                  'shrink-0',
                  isSignOutItem(item)
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-slate-500 dark:text-slate-400'
                ]"
              />
              <span class="truncate font-medium">
                {{ item.label }}
              </span>
            </component>
          </nav>
        </div>
      </Transition>
    </div>

    <!-- Mobile: open modal -->
    <button
      type="button"
      class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:hidden"
      @click="isMobileModalOpen = true"
    >
      <AppAvatar
        :src="avatarSrc"
        :alt="avatarAlt"
        size="xs"
        class="border border-slate-200 dark:border-slate-700"
      />
    </button>

    <AppModal
      v-model="isMobileModalOpen"
      max-width="sm"
      align="top"
    >
      <div class="rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
        <div class="px-1 pb-4">
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            Account
          </p>
          <p class="mt-1 truncate text-base font-bold text-slate-900 dark:text-white">
            {{ userEmail ?? items[0]?.[0]?.label ?? avatarAlt }}
          </p>
          <p
            v-if="subtitle"
            class="mt-0.5 text-xs text-slate-500 dark:text-slate-400"
          >
            {{ subtitle }}
          </p>
        </div>

        <div class="h-px bg-slate-100 dark:bg-slate-800" />

        <nav class="flex flex-col py-2">
          <component
            :is="item.to ? 'NuxtLink' : 'button'"
            v-for="(item, index) in modalMenuItems"
            :key="index"
            :to="item.to"
            v-bind="item.to ? {} : { type: 'button' }"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-base transition-colors"
            :class="[
              isSignOutItem(item)
                ? 'mt-1 border-t border-slate-100 text-red-600 hover:bg-red-50 dark:border-slate-800/80 dark:text-red-400 dark:hover:bg-red-950/40'
                : 'text-slate-900 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800/70'
            ]"
            @click="handleItemClick(item)"
          >
            <AppLucideIcon
              v-if="item.icon"
              :name="item.icon"
              :size="20"
              :class="isSignOutItem(item) ? 'shrink-0 text-red-600 dark:text-red-400' : 'shrink-0 text-slate-600 dark:text-slate-400'"
            />
            <span class="truncate font-medium">{{ item.label }}</span>
          </component>
        </nav>
      </div>
    </AppModal>
  </div>
</template>
