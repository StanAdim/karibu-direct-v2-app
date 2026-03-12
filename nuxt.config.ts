// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@artmizu/nuxt-prometheus',
    '@bubblesortt/nuxt-es-toolkit',
    '@coremyslo/nuxt-icon-font',
    '@morev/vue-transitions',
    '@nuxtjs/device'
  ],

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
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
    { path: '~/components', pathPrefix: false }
  ],

  typescript: {
    strict: true,
    typeCheck: false
  }
})