<script setup lang="ts">
import ToastContainer from '~/components/common/ToastContainer.vue'

const config = useRuntimeConfig()

interface Props {
  heroTitle?: string
  heroSubtitle?: string
  heroImage?: string
  showHeroStats?: boolean
  stats?: Array<{ icon: string; title: string; subtitle: string }>
}

withDefaults(defineProps<Props>(), {
  heroTitle: 'Start your journey to unforgettable experiences.',
  heroSubtitle: 'Join over 50,000+ people discovering and hosting world-class events every single day.',
  showHeroStats: true,
  stats: () => [
    { icon: 'confirmation_number', title: '1M+ Tickets', subtitle: 'Sold this year alone' },
    { icon: 'groups', title: '500+ Communities', subtitle: 'Active every weekend' }
  ]
})
const imageLogo = computed(() => `/images/logo.png`)
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Hero Panel (Left Side) -->
    <div class="hidden lg:flex lg:w-1/2 relative flex-col justify-center p-10 bg-primary-500 overflow-hidden">
      <!-- Dot Pattern Background -->
      <div
        class="absolute inset-0 opacity-20"
        style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"
      />

      <!-- Optional Background Image -->
      <div
        v-if="heroImage"
        class="absolute inset-0 opacity-30 bg-cover bg-center"
        :style="`background-image: url('${heroImage}')`"
      />

      <!-- Content -->
      <div class="relative z-10 max-w-xl">
        <!-- Brand -->
        <div class="flex items-center gap-3 mb-8">
          <div class="bg-white/20 p-2 rounded-lg backdrop-blur-md">
<!--            <span class="material-symbols-outlined text-white text-3xl">event_upcoming</span>-->
            <NuxtLink to="/" class="flex items-center gap-2">

            <img
                :src="imageLogo"
                alt="logo"
                class="h-10 w-10 rounded-lg object-cover group-hover:scale-105 transition-transform duration-500"
            />
            </NuxtLink>

          </div>
          <h2 class="text-white text-2xl font-black tracking-tight">{{ config.public.appName }}</h2>
        </div>

        <!-- Hero Text -->
        <h1 class="text-white text-5xl font-black leading-tight mb-4">
          {{ heroTitle }}
        </h1>

        <p class="text-white/80 text-lg mb-6 leading-relaxed">
          {{ heroSubtitle }}
        </p>

        <!-- Stats -->
        <div v-if="showHeroStats && stats.length" class="grid grid-cols-2 gap-4">
          <div
            v-for="stat in stats"
            :key="stat.title"
            class="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10"
          >
            <span class="material-symbols-outlined text-white mb-2">{{ stat.icon }}</span>
            <p class="text-white font-bold">{{ stat.title }}</p>
            <p class="text-white/60 text-sm">{{ stat.subtitle }}</p>
          </div>
        </div>
      </div>

      <!-- Decorative Blur -->
      <div class="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
    </div>

    <!-- Form Panel (Right Side) -->
    <div class="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 md:p-8 lg:p-10 bg-white dark:bg-background-dark">
      <div class="w-full max-w-[480px]">
        <!-- Mobile Brand (only visible on mobile) -->
        <div class="lg:hidden mb-6 text-center">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2"
          >
            <div class="bg-primary-500 p-2 rounded-lg">
              <span class="material-symbols-outlined text-white">event_upcoming</span>
            </div>
            <span class="text-xl font-bold text-slate-900 dark:text-white">
              {{ config.public.appName }}
            </span>
          </NuxtLink>
        </div>

        <slot />

        <!-- Footer -->
        <p class="mt-6 text-center text-xs text-slate-400">
          &copy; {{ new Date().getFullYear() }} {{ config.public.appName }}. All rights reserved.
        </p>
      </div>
    </div>
    <ToastContainer />
  </div>
</template>
