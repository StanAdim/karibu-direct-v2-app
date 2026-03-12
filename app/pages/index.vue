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
  { id: 'tech', label: 'Technology', icon: 'terminal' },
  { id: 'arts', label: 'Arts', icon: 'palette' },
  { id: 'sports', label: 'Sports', icon: 'fitness_center' }
]

const featuredEvents = ref([
  {
    id: '1',
    title: 'Serengeti Gala Night 2024',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    date: 'Nov 24',
    location: 'Mlimani City, Dar es Salaam',
    price: 'TZS 150,000',
    category: 'Music',
    attendees: '1.2k'
  },
  {
    id: '2',
    title: 'Tech & Innovation Expo',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    date: 'Dec 02',
    location: 'AICC, Arusha',
    price: 'TZS 50,000',
    category: 'Technology',
    attendees: '850'
  },
  {
    id: '3',
    title: 'Zanzibar Beach Festival',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
    date: 'Dec 15',
    location: 'Kendwa Rocks, Zanzibar',
    price: 'TZS 80,000',
    category: 'Music',
    attendees: '2.5k'
  },
  {
    id: '4',
    title: 'East African Food Festival',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
    date: 'Dec 21',
    location: 'Oyster Bay, Dar es Salaam',
    price: 'Free',
    category: 'Food',
    attendees: '500'
  }
])

const popularCities = [
  { name: 'Dar es Salaam', image: 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400', eventCount: 156 },
  { name: 'Arusha', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400', eventCount: 89 },
  { name: 'Zanzibar', image: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=400', eventCount: 124 },
  { name: 'Mwanza', image: 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=400', eventCount: 45 },
  { name: 'Dodoma', image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400', eventCount: 32 },
  { name: 'Moshi', image: 'https://images.unsplash.com/photo-1621414050946-1b936a78491d?w=400', eventCount: 67 }
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
      highlight="Near You"
      subtitle="Find concerts, workshops, and meetups happening in your city."
      background-image="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600"
      :show-search="true"
      :show-location-select="true"
      @search="handleSearch"
    />

    <!-- Categories -->
    <section class="px-6 py-8">
      <div class="mx-auto max-w-7xl">
        <div class="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
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
    <section class="px-6 py-12">
      <div class="mx-auto max-w-7xl">
        <div class="flex items-end justify-between mb-10">
          <div>
            <h3 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Featured Events</h3>
            <p class="mt-2 text-slate-500 dark:text-slate-400">Hand-picked experiences you can't miss</p>
          </div>
          <NuxtLink
            to="/events"
            class="text-sm font-bold text-primary-500 hover:underline"
          >
            View All Events
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <EventCard
            v-for="event in featuredEvents"
            :key="event.id"
            :event="event"
            @click="handleViewEvent(event.id)"
          />
        </div>
      </div>
    </section>

    <!-- Popular Cities -->
    <section class="bg-primary-500/5 px-6 py-20 dark:bg-slate-900/50">
      <div class="mx-auto max-w-7xl">
        <h3 class="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Explore Popular Cities</h3>
        <div class="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
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
    <section class="px-6 py-20">
      <div class="mx-auto max-w-7xl">
        <h3 class="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">How It Works</h3>
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
