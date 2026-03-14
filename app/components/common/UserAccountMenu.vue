<script setup lang="ts">
import { ref, computed } from 'vue'

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
}
</script>

<template>
  <div class="flex items-center">
    <!-- Desktop: avatar trigger with custom popover panel matching design -->
    <UPopover
      class="hidden sm:block"
      :content="{ side: 'bottom', align: 'end', sideOffset: 8 }"
      :ui="{ content: 'p-0 rounded-2xl shadow-xl ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden min-w-[250px]' }"
    >
      <UButton
        color="neutral"
        variant="ghost"
        class="gap-2 rounded-full px-1.5 py-1.5"
      >
        <UAvatar
          :alt="avatarAlt"
          :src="avatarSrc || undefined"
          size="xs"
          class="border border-slate-200 dark:border-slate-700"
        />
        <UIcon
          name="i-lucide-chevron-down"
          class="h-4 w-4 text-slate-500 dark:text-slate-400"
        />
      </UButton>

      <template #content="{ close }">
        <div class="w-72 bg-white dark:bg-slate-900">
          <!-- Header: ACCOUNT + email -->
          <div class="px-5 pt-5 pb-4">
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

          <!-- Separator -->
          <div class="h-px bg-slate-100 dark:bg-slate-800" />

          <!-- Menu items: icon + label; Sign Out in red -->
          <nav class="py-2">
            <component
              v-for="(item, index) in modalMenuItems"
              :key="index"
              :is="item.to ? 'NuxtLink' : 'button'"
              :to="item.to"
              type="button"
              class="flex w-full items-center gap-3 px-5 py-2.5 text-left text-[15px] transition-colors"
              :class="[
                isSignOutItem(item)
                  ? 'mt-1 border-t border-slate-100 text-red-600 hover:bg-red-50 dark:border-slate-800/80 dark:text-red-400 dark:hover:bg-red-950/40'
                  : 'text-slate-900 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800/80'
              ]"
              @click="
                () => {
                  handleItemClick(item)
                  close()
                }
              "
            >
              <UIcon
                v-if="item.icon"
                :name="item.icon"
                :class="[
                  'h-5 w-5 shrink-0',
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
      </template>
    </UPopover>

    <!-- Mobile: open modal -->
    <button
      type="button"
      class="sm:hidden inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      @click="isMobileModalOpen = true"
    >
      <UAvatar
        :alt="avatarAlt"
        :src="avatarSrc || undefined"
        size="xs"
        class="border border-slate-200 dark:border-slate-700"
      />
    </button>

    <!-- Mobile Modal: matches account dropdown design (ACCOUNT + email, icon list, red Sign Out) -->
    <AppModal
      v-model="isMobileModalOpen"
      max-width="sm"
      align="top"
    >
      <div class="rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
        <!-- Header: ACCOUNT + email -->
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

        <!-- Separator -->
        <div class="h-px bg-slate-100 dark:bg-slate-800" />

        <!-- Menu items: icon + label; Sign Out in red -->
        <nav class="flex flex-col py-2">
          <component
            v-for="(item, index) in modalMenuItems"
            :key="index"
            :is="item.to ? 'NuxtLink' : 'button'"
            :to="item.to"
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-base transition-colors"
            :class="[
              isSignOutItem(item)
                ? 'mt-1 border-t border-slate-100 text-red-600 hover:bg-red-50 dark:border-slate-800/80 dark:text-red-400 dark:hover:bg-red-950/40'
                : 'text-slate-900 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800/70'
            ]"
            @click="handleItemClick(item)"
          >
            <UIcon
              v-if="item.icon"
              :name="item.icon"
              :class="isSignOutItem(item) ? 'h-5 w-5 text-red-600 dark:text-red-400' : 'h-5 w-5 text-slate-600 dark:text-slate-400'"
            />
            <span class="truncate font-medium">{{ item.label }}</span>
          </component>
        </nav>
      </div>
    </AppModal>
  </div>
</template>

