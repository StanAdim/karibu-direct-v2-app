<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface NavLink {
  label: string
  to: string
  active?: boolean
}

interface Props {
  navLinks?: NavLink[]
  showSearch?: boolean
  showAuthButtons?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  navLinks: () => [
    { label: 'Explore', to: '/events' },
    { label: 'Host an Event', to: '/organizer/dashboard' },
    { label: 'Help', to: '/help' },
  ],
  showSearch: false,
  showAuthButtons: true,
})

const config = useRuntimeConfig()
const route = useRoute()
const { user } = useAuth()
const authStore = useAuthStore()

const isMobileMenuOpen = ref(false)

const resolvedNavLinks = computed(() =>
  props.navLinks.map(link => ({
    ...link,
    active:
      link.active
      ?? (route.path === link.to
        || (link.to !== '/' && route.path.startsWith(link.to))
        || (link.to === '/events' && route.path === '/')),
  })),
)

const imageLogo = computed(() => `/images/logo.png`)

const defaultUserRoute = computed(() => authStore.getDefaultRoute())

watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false
  },
)

function navLinkClass(link: NavLink & { active?: boolean }): string {
  return link.active
    ? 'text-primary-600 dark:text-primary-400 font-semibold'
    : 'text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400'
}
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full glass-public-nav shadow-sm shadow-slate-900/5 transition-[box-shadow,backdrop-filter] duration-300 ease-out dark:shadow-none"
  >
    <div class="public-container flex items-center justify-between gap-4 py-3 lg:py-3.5">
      <NuxtLink
        to="/"
        class="public-focus-ring group flex shrink-0 items-center gap-2.5 rounded-lg"
        :aria-label="`Home — ${config.public.appName}`"
      >
        <div
          class="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-primary-500 text-white shadow-md shadow-primary-500/25 transition-all duration-300"
        >
          <img
            :src="imageLogo"
            alt=""
            width="40"
            height="40"
            class="size-10 object-cover transition-transform duration-500 group-hover:scale-105"
          >
        </div>
        <span
          class="text-lg font-bold tracking-tight text-slate-900 transition-colors dark:text-white"
        >
          {{ config.public.appName }}
        </span>
      </NuxtLink>

      <nav
        class="hidden items-center gap-1 md:flex md:gap-0.5 lg:gap-1"
        aria-label="Primary"
      >
        <NuxtLink
          v-for="link in resolvedNavLinks"
          :key="link.to"
          :to="link.to"
          :class="[
            'rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200',
            navLinkClass(link),
          ]"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div
        v-if="showSearch"
        class="mx-4 hidden max-w-md flex-1 items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/80 lg:flex"
      >
        <AppLucideIcon name="search" class="text-lg text-slate-400" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search events, artists…"
          class="public-focus-ring w-full border-none bg-transparent p-0 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-0 dark:text-white"
        >
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <template v-if="showAuthButtons && !user">
          <NuxtLink
            to="/login"
            class="public-focus-ring hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-primary-600 dark:text-slate-200 dark:hover:text-primary-400 sm:inline"
          >
            Log in
          </NuxtLink>
          <AppButton to="/register" size="sm" class="!shadow-lg !shadow-primary-500/20">
            Sign up
          </AppButton>
        </template>

        <NuxtLink
          v-else-if="user"
          :to="defaultUserRoute"
          class="public-focus-ring relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary-500/30 bg-primary-500/10 transition-all duration-300 hover:border-primary-500/55 dark:border-primary-400/35 dark:bg-primary-500/15"
          :aria-label="'Go to your dashboard'"
        >
          <img
            v-if="user.avatar"
            :src="user.avatar"
            alt=""
            class="size-full object-cover"
          >
          <AppLucideIcon
            v-else
            name="person"
            class="text-xl text-primary-600 dark:text-primary-400"
          />
        </NuxtLink>

        <button
          type="button"
          class="public-focus-ring inline-flex rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          :aria-expanded="isMobileMenuOpen"
          aria-controls="public-mobile-nav"
          aria-label="Toggle navigation menu"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <AppLucideIcon
            :name="isMobileMenuOpen ? 'close' : 'menu'"
            class="size-6"
          />
        </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="isMobileMenuOpen"
        id="public-mobile-nav"
        class="border-t border-slate-200 bg-white/95 backdrop-blur-xl md:hidden dark:border-slate-800 dark:bg-slate-950/95"
      >
        <nav
          class="public-container flex flex-col gap-1 py-4"
          aria-label="Mobile primary"
        >
          <NuxtLink
            v-for="link in resolvedNavLinks"
            :key="link.to"
            :to="link.to"
            :class="[
              'rounded-xl px-3 py-3 text-base font-semibold transition-colors',
              link.active
                ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                : 'text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-900',
            ]"
            @click="isMobileMenuOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
          <template v-if="showAuthButtons && !user">
            <NuxtLink
              to="/login"
              class="rounded-xl px-3 py-3 text-base font-semibold text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-900 sm:hidden"
              @click="isMobileMenuOpen = false"
            >
              Log in
            </NuxtLink>
          </template>
        </nav>
      </div>
    </Transition>
  </header>
</template>
