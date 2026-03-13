<script setup lang="ts">
definePageMeta({
  layout: 'public'
})

const { isAuthenticated, user } = useAuth()
const authStore = useAuthStore()
const router = useRouter()

const activeCategory = ref('all')

const categories = [
  { id: 'all', label: 'All Events', icon: 'grid_view' },
  { id: 'music', label: 'Music', icon: 'music_note' },
  { id: 'business', label: 'Business', icon: 'business_center' },
  { id: 'food', label: 'Food & Drink', icon: 'restaurant' },
  { id: 'tech', label: 'Technology', icon: 'desktop_windows' },
  { id: 'arts', label: 'Arts', icon: 'palette' },
  { id: 'sports', label: 'Sports', icon: 'directions_run' }
]

const featuredEvents = ref([
  {
    id: '1',
    title: 'Tech Summit 2024',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    date: 'OCT 12',
    location: 'Downtown Convention Center',
    price: 99,
    category: 'Technology',
    attendees: '1.2k'
  },
  {
    id: '2',
    title: 'Jazz in the Park',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800',
    date: 'OCT 14',
    location: 'Central Park Amphitheater',
    price: 'Free',
    category: 'Music',
    attendees: '850'
  },
  {
    id: '3',
    title: 'Startup Weekend',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    date: 'OCT 20',
    location: 'Innovation Hub',
    price: 50,
    category: 'Business',
    attendees: '300'
  },
  {
    id: '4',
    title: 'Cooking Masterclass',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
    date: 'OCT 21',
    location: 'Culinary Institute',
    price: 75,
    category: 'Food & Drink',
    attendees: '45'
  }
])

const popularCities = [
  { name: 'New York', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400', eventCount: 320 },
  { name: 'London', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400', eventCount: 280 },
  { name: 'Tokyo', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400', eventCount: 195 },
  { name: 'Berlin', image: 'https://images.unsplash.com/photo-1560930950-5cc20e80e122?w=400', eventCount: 168 },
  { name: 'Paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400', eventCount: 240 },
  { name: 'San Francisco', image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400', eventCount: 156 }
]

const howItWorks = [
  { step: 1, title: 'Find Events', icon: 'search', description: 'Browse thousands of events or search for specific interests and locations.' },
  { step: 2, title: 'Book Tickets', icon: 'local_activity', description: 'Secure your spot instantly with our fast and safe checkout process.' },
  { step: 3, title: 'Have Fun', icon: 'celebration', description: 'Get your tickets on your phone and enjoy your unforgettable experience.' }
]

function getStartedRoute(): string {
  if (isAuthenticated.value && user.value) {
    return authStore.getDefaultRoute()
  }
  return '/register'
}

function handleSearch(query: string, location?: string) {
  router.push({
    path: '/events',
    query: { q: query, location }
  })
}

function handleViewEvent(id: string | number) {
  router.push(`/events/${id}`)
}

function handleSelectCity(city: string) {
  router.push({
    path: '/events',
    query: { location: city }
  })
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <HeroSection
      title="Discover Amazing Events "
      highlight=" Near You"
      subtitle="Find concerts, workshops, and meetups happening in your city."
      background-image="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600"
      :show-search="true"
      :show-location-select="true"
      :locations="['New York, NY', 'Dar es Salaam', 'Arusha', 'Zanzibar', 'London', 'Tokyo']"
      @search="handleSearch"
    />

    <!-- Category pills -->
    <section class="px-4 py-4 md:px-6">
      <div class="mx-auto max-w-7xl">
        <div class="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <CategoryButton
            v-for="cat in categories"
            :key="cat.id"
            :label="cat.label"
            :icon="cat.icon"
            :active="activeCategory === cat.id"
            @click="activeCategory = cat.id"
          />
        </div>
      </div>
    </section>

    <!-- Featured Events -->
    <section class="px-4 py-12 md:px-6 bg-slate-50/50 dark:bg-slate-900/30">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Featured Events</h2>
            <p class="mt-2 text-slate-500 dark:text-slate-400">Hand-picked experiences you can't miss</p>
          </div>
          <NuxtLink
            to="/events"
            class="text-sm font-bold text-primary-500 hover:text-primary-600 transition-colors shrink-0"
          >
            View All Events
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <PublicEventCard
            v-for="event in featuredEvents"
            :key="event.id"
            :id="event.id"
            :title="event.title"
            :image="event.image"
            :date="event.date"
            :location="event.location"
            :price="event.price"
            :category="event.category"
            :attendees="event.attendees"
            @click="handleViewEvent(event.id)"
          />
        </div>
      </div>
    </section>

    <!-- Explore Popular Cities: circular cards -->
    <section class="px-4 py-16 md:px-6">
      <div class="mx-auto max-w-7xl">
        <h2 class="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Explore Popular Cities</h2>
        <div class="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          <CityCard
            v-for="city in popularCities"
            :key="city.name"
            :name="city.name"
            :image="city.image"
            :event-count="city.eventCount"
            @click="handleSelectCity(city.name)"
          />
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="px-4 py-20 md:px-6 bg-slate-50/50 dark:bg-slate-900/30">
      <div class="mx-auto max-w-7xl">
        <h2 class="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">How It Works</h2>
        <div class="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
          <FeatureStep
            v-for="step in howItWorks"
            :key="step.step"
            :step="step.step"
            :title="step.title"
            :icon="step.icon"
            :description="step.description"
          />
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="relative overflow-hidden bg-primary-500 py-20">
      <div
        class="absolute inset-0 opacity-10"
        style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"
      />
      <div class="relative mx-auto max-w-7xl px-6 text-center">
        <h2 class="text-4xl font-black text-white">
          Ready to Host Your Own Event?
        </h2>
        <p class="mx-auto mt-4 max-w-xl text-lg text-white/80">
          Join thousands of organizers who trust our platform to create memorable experiences.
        </p>
        <div class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <NuxtLink :to="getStartedRoute()">
            <button class="bg-white text-primary-500 px-8 py-4 rounded-xl font-bold text-base shadow-lg hover:bg-white/90 transition-all">
              {{ isAuthenticated ? 'Go to Dashboard' : 'Start for Free' }}
            </button>
          </NuxtLink>
          <NuxtLink to="/organizer">
            <button class="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-white/10 transition-all">
              Learn More
            </button>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
