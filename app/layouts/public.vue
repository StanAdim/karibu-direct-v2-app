<script setup lang="ts">
const config = useRuntimeConfig()
const { user } = useAuth()
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

withDefaults(defineProps<Props>(), {
  showNavbar: true,
  showFooter: true,
  navLinks: () => [
    { label: 'Explore', to: '/events', active: true },
    { label: 'Host an Event', to: '/organizer' },
    { label: 'Help', to: '/help' }
  ],
  showSearch: false,
  showAuthButtons: true
})

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
  <div class="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[var(--color-background-light)] dark:bg-[var(--color-background-dark)]">
    <!-- Navbar -->
    <header
      v-if="showNavbar"
      class="sticky top-0 z-50 w-full border-b border-primary-500/10 bg-white/80 dark:bg-[var(--color-background-dark)]/80 backdrop-blur-md"
    >
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <!-- Brand -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-white">
            <span class="material-symbols-outlined">event_seat</span>
          </div>
          <h1 class="text-xl font-bold tracking-tight text-primary-500">{{ config.public.appName }}</h1>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-8">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-sm font-semibold transition-colors"
            :class="link.active ? 'text-primary-500' : 'text-slate-600 dark:text-slate-400 hover:text-primary-500'"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Search (optional) -->
        <div
          v-if="showSearch"
          class="hidden lg:flex w-full max-w-md items-center gap-2 rounded-xl bg-primary-500/5 dark:bg-primary-500/10 px-4 py-2 border border-primary-500/10 mx-8"
        >
          <span class="material-symbols-outlined text-primary-500/60">search</span>
          <input
            type="text"
            placeholder="Search events, artists..."
            class="w-full border-none bg-transparent p-0 text-sm focus:ring-0 placeholder:text-slate-400 outline-none"
          />
        </div>

        <!-- Auth Buttons / User Avatar -->
        <div class="flex items-center gap-4">
          <template v-if="showAuthButtons && !user">
            <NuxtLink
              to="/login"
              class="text-sm font-semibold hover:text-primary-500 transition-colors px-4 hidden sm:block"
            >
              Log In
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-500/90 transition-all"
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
          class="md:hidden border-t border-primary-500/10 bg-white dark:bg-[var(--color-background-dark)] px-6 py-4"
        >
          <nav class="flex flex-col gap-4">
            <NuxtLink
              v-for="link in navLinks"
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
      class="border-t border-primary-500/10 bg-white dark:bg-[var(--color-background-dark)] px-6 py-16"
    >
      <div class="mx-auto max-w-7xl">
        <div class="grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5">
          <!-- Brand Column -->
          <div class="col-span-1 lg:col-span-2">
            <div class="flex items-center gap-2">
              <div class="flex h-8 w-8 items-center justify-center rounded bg-primary-500 text-white">
                <span class="material-symbols-outlined text-sm">event_seat</span>
              </div>
              <h2 class="text-lg font-bold tracking-tight text-primary-500">{{ config.public.appName }}</h2>
            </div>
            <p class="mt-6 max-w-xs text-sm text-slate-500 leading-relaxed">
              Connecting people through shared experiences. Discover, host, and manage amazing events worldwide.
            </p>
            <div class="mt-8 flex gap-4">
              <a
                v-for="social in ['facebook', 'twitter', 'instagram']"
                :key="social"
                href="#"
                class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-primary-500 hover:text-white transition-colors text-slate-600 dark:text-slate-400"
              >
                <span class="material-symbols-outlined text-sm">{{ social === 'twitter' ? 'close' : social }}</span>
              </a>
            </div>
          </div>

          <!-- Link Columns -->
          <div v-for="section in footerSections" :key="section.title">
            <h5 class="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{{ section.title }}</h5>
            <ul class="mt-6 space-y-4 text-sm text-slate-500">
              <li v-for="link in section.links" :key="link.href">
                <a :href="link.href" class="hover:text-primary-500 transition-colors">
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="mt-16 flex flex-col items-center justify-between gap-6 border-t border-slate-100 dark:border-slate-800 pt-10 md:flex-row">
          <p class="text-xs text-slate-400">&copy; {{ new Date().getFullYear() }} {{ config.public.appName }}. All rights reserved.</p>
          <div class="flex gap-8 text-xs text-slate-400">
            <a href="/terms" class="hover:text-primary-500">Terms of Service</a>
            <a href="/privacy" class="hover:text-primary-500">Privacy Policy</a>
            <a href="/cookies" class="hover:text-primary-500">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
