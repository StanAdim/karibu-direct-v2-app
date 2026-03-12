<script setup lang="ts">
definePageMeta({
  layout: false
})

const { isAuthenticated, user } = useAuth()
const authStore = useAuthStore()

const features = [
  {
    icon: 'i-lucide-calendar',
    title: 'Event Management',
    description: 'Create and manage events with ease. From small meetups to large conferences.'
  },
  {
    icon: 'i-lucide-ticket',
    title: 'Ticketing',
    description: 'Sell tickets, manage registrations, and track attendance in real-time.'
  },
  {
    icon: 'i-lucide-qr-code',
    title: 'Check-in System',
    description: 'Fast and reliable check-in with QR codes and multiple checkpoint support.'
  },
  {
    icon: 'i-lucide-bar-chart-3',
    title: 'Analytics',
    description: 'Gain insights with comprehensive analytics and reporting tools.'
  }
]

const stats = [
  { value: '10K+', label: 'Events Hosted' },
  { value: '500K+', label: 'Attendees' },
  { value: '1000+', label: 'Organizers' },
  { value: '99.9%', label: 'Uptime' }
]

function getStartedRoute(): string {
  if (isAuthenticated.value && user.value) {
    return authStore.getDefaultRoute()
  }
  return '/register'
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-950">
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NuxtLink
          to="/"
          class="flex items-center gap-2"
        >
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
            <UIcon
              name="i-lucide-calendar-check"
              class="h-5 w-5"
            />
          </div>
          <span class="text-xl font-bold text-gray-900 dark:text-white">EventHub</span>
        </NuxtLink>

        <nav class="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            class="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Features
          </a>
          <a
            href="#pricing"
            class="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Pricing
          </a>
        </nav>

        <div class="flex items-center gap-3">
          <NuxtLink
            v-if="!isAuthenticated"
            to="/login"
          >
            <UButton
              variant="ghost"
              color="neutral"
            >
              Sign in
            </UButton>
          </NuxtLink>
          <NuxtLink :to="getStartedRoute()">
            <UButton>
              {{ isAuthenticated ? 'Go to Dashboard' : 'Get Started' }}
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white px-4 py-20 dark:from-gray-900 dark:to-gray-950 sm:py-32">
      <div class="mx-auto max-w-7xl">
        <div class="text-center">
          <UBadge
            color="primary"
            variant="soft"
            size="lg"
            class="mb-6"
          >
            The Future of Event Management
          </UBadge>

          <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Create Unforgettable
            <span class="text-primary-500">Events</span>
          </h1>

          <p class="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            EventHub is your all-in-one platform for creating, managing, and attending events.
            From intimate workshops to massive conferences, we've got you covered.
          </p>

          <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <NuxtLink :to="getStartedRoute()">
              <UButton
                size="xl"
                icon="i-lucide-rocket"
              >
                {{ isAuthenticated ? 'Go to Dashboard' : 'Start for Free' }}
              </UButton>
            </NuxtLink>
            <a href="#features">
              <UButton
                size="xl"
                variant="outline"
                color="neutral"
              >
                Learn More
              </UButton>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="border-y border-gray-200 bg-gray-50 py-12 dark:border-gray-800 dark:bg-gray-900">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="text-center"
          >
            <div class="text-3xl font-bold text-primary-500 sm:text-4xl">
              {{ stat.value }}
            </div>
            <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section
      id="features"
      class="py-20 sm:py-32"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Everything you need to succeed
          </h2>
          <p class="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
            Powerful features to help you create amazing events and deliver exceptional experiences.
          </p>
        </div>

        <div class="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="group rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-primary-500 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
          >
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 transition-colors group-hover:bg-primary-500 group-hover:text-white dark:bg-primary-950">
              <UIcon
                :name="feature.icon"
                class="h-6 w-6"
              />
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              {{ feature.title }}
            </h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-primary-500 py-16">
      <div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-white">
          Ready to get started?
        </h2>
        <p class="mx-auto mt-4 max-w-xl text-primary-100">
          Join thousands of event organizers who trust EventHub to create memorable experiences.
        </p>
        <div class="mt-8">
          <NuxtLink :to="isAuthenticated ? getStartedRoute() : '/register'">
            <UButton
              size="xl"
              color="neutral"
              variant="solid"
            >
              {{ isAuthenticated ? 'Go to Dashboard' : 'Create Your First Event' }}
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-gray-200 bg-white py-12 dark:border-gray-800 dark:bg-gray-950">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
              <UIcon
                name="i-lucide-calendar-check"
                class="h-5 w-5"
              />
            </div>
            <span class="text-lg font-bold text-gray-900 dark:text-white">EventHub</span>
          </div>

          <p class="text-sm text-gray-600 dark:text-gray-400">
            &copy; {{ new Date().getFullYear() }} EventHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
