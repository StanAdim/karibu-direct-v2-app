<script setup lang="ts">
interface FooterLink {
  label: string
  href: string
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

interface Props {
  sections?: FooterSection[]
}

const props = withDefaults(defineProps<Props>(), {
  sections: undefined,
})

const config = useRuntimeConfig()

const defaultSections: FooterSection[] = [
  {
    title: 'Organize',
    links: [
      { label: 'Host an event', href: '/organizer/dashboard' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Marketing tools', href: '/marketing' },
      { label: 'Management', href: '/management' },
    ],
  },
  {
    title: 'Discover',
    links: [
      { label: 'Browse events', href: '/events' },
      { label: 'Virtual events', href: '/events?type=virtual' },
      { label: 'Music', href: '/events?category=music' },
      { label: 'Local guides', href: '/guides' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help center', href: '/help' },
      { label: 'Contact', href: '/support' },
      { label: 'Community', href: '/support' },
    ],
  },
]

const footerSections = computed(() => props.sections ?? defaultSections)

const socialLinks = [
  { label: 'Twitter / X', href: 'https://twitter.com', icon: 'chat' as const },
  { label: 'Instagram', href: 'https://instagram.com', icon: 'photo_camera' as const },
  { label: 'Facebook', href: 'https://facebook.com', icon: 'groups' as const },
]

const newsletterEmail = ref('')
function onNewsletterSubmit(e: Event): void {
  e.preventDefault()
  newsletterEmail.value = ''
}

function linkIsExternal(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

const imageLogo = computed(() => `/images/logo.png`)
</script>

<template>
  <footer
    class="relative mt-auto border-t border-slate-200/80 bg-gradient-to-b from-white to-slate-50/90 dark:border-slate-800/80 dark:from-slate-950 dark:to-[#0c0a12]"
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/25 to-transparent"
      aria-hidden="true"
    />

    <div class="public-container py-14 lg:py-16">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
        <div class="lg:col-span-4">
          <div class="flex items-center gap-2.5">
            <div class="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-primary-500 shadow-lg shadow-primary-500/25">
              <img :src="imageLogo" alt="" width="40" height="40" class="size-10 object-cover">
            </div>
            <h2 class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {{ config.public.appName }}
            </h2>
          </div>
          <p class="mt-4 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Connecting people through shared experiences. Discover, host, and manage memorable events—from intimate workshops to city-wide festivals.
          </p>
          <div class="mt-6 flex flex-wrap gap-2">
            <a
              v-for="s in socialLinks"
              :key="s.label"
              :href="s.href"
              target="_blank"
              rel="noopener noreferrer"
              class="public-focus-ring flex size-10 items-center justify-center rounded-full border border-slate-200/90 bg-white text-slate-500 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-primary-500/40 dark:hover:bg-primary-500/10 dark:hover:text-primary-300"
              :aria-label="s.label"
            >
              <AppLucideIcon :name="s.icon" class="text-lg" />
            </a>
          </div>
        </div>

        <div
          v-for="section in footerSections"
          :key="section.title"
          class="lg:col-span-2"
        >
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            {{ section.title }}
          </h3>
          <ul class="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li v-for="link in section.links" :key="link.href + link.label">
              <a
                v-if="linkIsExternal(link.href)"
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex transition-colors hover:text-primary-600 dark:hover:text-primary-400"
              >
                {{ link.label }}
              </a>
              <NuxtLink
                v-else
                :to="link.href"
                class="inline-flex transition-colors hover:text-primary-600 dark:hover:text-primary-400"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="lg:col-span-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Stay in the loop
          </h3>
          <p class="mt-4 text-sm text-slate-600 dark:text-slate-400">
            Occasional updates on new features and events near you. No spam.
          </p>
          <form
            class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-stretch"
            @submit="onNewsletterSubmit"
          >
            <label class="sr-only" for="footer-newsletter-email">Email</label>
            <input
              id="footer-newsletter-email"
              v-model="newsletterEmail"
              type="email"
              name="email"
              autocomplete="email"
              placeholder="you@example.com"
              class="public-focus-ring min-h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-inner placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
            <button
              type="submit"
              class="public-focus-ring inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-primary-500 px-5 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition hover:bg-primary-600"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div class="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-8 dark:border-slate-800 md:flex-row">
        <p class="text-center text-xs text-slate-500 dark:text-slate-500 md:text-left">
          &copy; {{ new Date().getFullYear() }} {{ config.public.appName }}. All rights reserved.
        </p>
        <nav class="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500" aria-label="Legal">
          <NuxtLink to="/terms" class="transition-colors hover:text-primary-600 dark:hover:text-primary-400">
            Terms
          </NuxtLink>
          <NuxtLink to="/privacy" class="transition-colors hover:text-primary-600 dark:hover:text-primary-400">
            Privacy
          </NuxtLink>
          <NuxtLink to="/cookies" class="transition-colors hover:text-primary-600 dark:hover:text-primary-400">
            Cookies
          </NuxtLink>
        </nav>
      </div>
    </div>
  </footer>
</template>
