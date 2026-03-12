// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@artmizu/nuxt-prometheus',
    '@bubblesortt/nuxt-es-toolkit',
    '@coremyslo/nuxt-icon-font',
    '@morev/vue-transitions',
    '@nuxtjs/device'
  ],

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'EventHub',
      appDescription: 'Enterprise Event Management Platform'
    }
  },

  pinia: {
    storesDirs: ['./stores/**']
  },

  imports: {
    dirs: ['composables/**', 'utils/**', 'stores/**']
  },

  components: [
    { path: '~/components/ui', prefix: 'App' },
    { path: '~/components/common', prefix: '' },
    { path: '~/components/dashboard', prefix: '' },
    { path: '~/components/events', prefix: '' },
    { path: '~/components/sessions', prefix: '' },
    { path: '~/components', pathPrefix: false }
  ],

  typescript: {
    strict: true,
    typeCheck: false
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'EventHub - Event Management Platform',
      meta: [
        { name: 'description', content: 'Enterprise-grade event management platform for organizers and attendees' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#4285F4' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },

  routeRules: {
    '/admin/**': { ssr: false },
    '/organizer/**': { ssr: false },
    '/attendee/**': { ssr: false }
  },

  nitro: {
    compressPublicAssets: true,
    routeRules: {
      '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } }
    }
  },

  experimental: {
    viewTransition: true
  }
})