<script setup lang="ts">
const config = useRuntimeConfig()
const { user } = useAuth()
const route = useRoute()
const isMobileMenuOpen = ref(false)

interface NavLink {
  label: string
  to: string
  active?: boolean
}

interface Props {
  showNavbar?: boolean
  showFooter?: boolean
  navLinks?: NavLink[]
  showSearch?: boolean
  showAuthButtons?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showNavbar: true,
  showFooter: true,
  navLinks: () => [
    { label: 'Explore', to: '/events' },
    { label: 'Host an Event', to: '/organizer' },
    { label: 'Help', to: '/help' }
  ],
  showSearch: false,
  showAuthButtons: true
})

const resolvedNavLinks = computed(() =>
  props.navLinks.map(link => ({
    ...link,
    active: link.active ?? (route.path === link.to || (link.to !== '/' && route.path.startsWith(link.to)) || (link.to === '/events' && route.path === '/'))
  }))
)

const footerSections = [
  {
    title: 'Plan Events',
    links: [
      { label: 'Sell Tickets Online', href: '/organizer' },
      { label: 'Event Marketing', href: '/marketing' },
      { label: 'Event Management', href: '/management' },
      { label: 'Pricing', href: '/pricing' }
    ]
  },
  {
    title: 'Find Events',
    links: [
      { label: 'Virtual Events', href: '/events?type=virtual' },
      { label: 'Online Classes', href: '/events?type=classes' },
      { label: 'Music Events', href: '/events?category=music' },
      { label: 'Local Guides', href: '/guides' }
    ]
  },
  {
    title: 'Connect',
    links: [
      { label: 'Contact Support', href: '/support' },
      { label: 'Twitter', href: 'https://twitter.com' },
      { label: 'Facebook', href: 'https://facebook.com' },
      { label: 'Instagram', href: 'https://instagram.com' }
    ]
  }
]
</script>

<template>
  <div class="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white dark:bg-slate-950">
    <!-- Navbar -->
    <header
      v-if="showNavbar"
      class="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md"
    >
      <div class="flex items-center justify-between px-6 py-4">
        <!-- Brand: icon + app name (dark) -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-white shrink-0">
            <span class="material-symbols-outlined text-xl">event</span>
          </div>
          <h1 class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{{ config.public.appName }}</h1>
        </NuxtLink>

        <!-- Desktop Navigation: Explore, Host an Event, Help -->
        <nav class="hidden md:flex items-center gap-8">
          <NuxtLink
            v-for="link in resolvedNavLinks"
            :key="link.to"
            :to="link.to"
            class="text-sm font-semibold transition-colors text-slate-700 dark:text-slate-300 hover:text-primary-500"
            :class="{ 'text-primary-500': link.active }"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Search (optional) -->
        <div
          v-if="showSearch"
          class="hidden lg:flex w-full max-w-md items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 mx-8"
        >
          <span class="material-symbols-outlined text-slate-400">search</span>
          <input
            type="text"
            placeholder="Search events, artists..."
            class="w-full border-none bg-transparent p-0 text-sm focus:ring-0 placeholder:text-slate-400 outline-none text-slate-900 dark:text-white"
          />
        </div>

        <!-- Auth: Log in (text) + Sign Up (purple button) -->
        <div class="flex items-center gap-4">
          <template v-if="showAuthButtons && !user">
            <NuxtLink
              to="/login"
              class="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-500 transition-colors hidden sm:inline"
            >
              Log in
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-600 transition-colors shadow-sm"
            >
              Sign Up
            </NuxtLink>
          </template>

          <!-- User Avatar (when logged in) -->
          <div
            v-if="user"
            class="h-10 w-10 overflow-hidden rounded-full border-2 border-primary-500/20 bg-primary-500/10 p-0.5"
          >
            <img
              v-if="user.avatar"
              :src="user.avatar"
              alt="User Avatar"
              class="h-full w-full rounded-full object-cover"
            />
            <div v-else class="h-full w-full rounded-full bg-primary-500/10 flex items-center justify-center">
              <span class="material-symbols-outlined text-primary-500">person</span>
            </div>
          </div>

          <!-- Mobile Menu Button -->
          <button
            class="md:hidden p-2 text-slate-600 dark:text-slate-400"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <span class="material-symbols-outlined">{{ isMobileMenuOpen ? 'close' : 'menu' }}</span>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="isMobileMenuOpen"
          class="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4"
        >
          <nav class="flex flex-col gap-4">
            <NuxtLink
              v-for="link in resolvedNavLinks"
              :key="link.to"
              :to="link.to"
              class="text-base font-semibold py-2"
              :class="link.active ? 'text-primary-500' : 'text-slate-600 dark:text-slate-400'"
              @click="isMobileMenuOpen = false"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
        </div>
      </Transition>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer
      v-if="showFooter"
      class="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-16"
    >
      <div class="mx-auto max-w-7xl">
        <div class="grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5">
          <!-- Brand Column -->
          <div class="col-span-1 lg:col-span-2">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white shrink-0">
                <span class="material-symbols-outlined text-sm">event</span>
              </div>
              <h2 class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">{{ config.public.appName }}</h2>
            </div>
            <p class="mt-6 max-w-sm text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Connecting people through shared experiences. Discover, host, and manage amazing events worldwide.
            </p>
            <div class="mt-8 flex gap-3">
              <a href="#" class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-primary-500 hover:text-white transition-colors text-slate-600 dark:text-slate-400" aria-label="Twitter">
                <span class="material-symbols-outlined text-lg">chat</span>
              </a>
              <a href="#" class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-primary-500 hover:text-white transition-colors text-slate-600 dark:text-slate-400" aria-label="Instagram">
                <span class="material-symbols-outlined text-lg">photo_camera</span>
              </a>
            </div>
          </div>

          <!-- Link Columns: PLAN EVENTS, FIND EVENTS, CONNECT -->
          <div v-for="section in footerSections" :key="section.title">
            <h5 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">{{ section.title }}</h5>
            <ul class="mt-6 space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li v-for="link in section.links" :key="link.href">
                <NuxtLink :to="link.href" class="hover:text-primary-500 transition-colors">
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="mt-16 flex flex-col items-center justify-between gap-6 border-t border-slate-200 dark:border-slate-800 pt-10 md:flex-row">
          <p class="text-xs text-slate-400">&copy; {{ new Date().getFullYear() }} {{ config.public.appName }} Inc. All rights reserved.</p>
          <div class="flex gap-8 text-xs text-slate-400">
            <NuxtLink to="/terms" class="hover:text-primary-500 transition-colors">Terms of Service</NuxtLink>
            <NuxtLink to="/privacy" class="hover:text-primary-500 transition-colors">Privacy Policy</NuxtLink>
            <NuxtLink to="/cookies" class="hover:text-primary-500 transition-colors">Cookie Settings</NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
