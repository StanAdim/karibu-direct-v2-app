export default defineNuxtPlugin((nuxtApp) => {
  const uiStore = useUiStore()

  const router = nuxtApp.$router

  router.beforeEach((to, from, next) => {
    if (to.fullPath !== from.fullPath) {
      uiStore.startNavigation()
    }
    next()
  })

  router.afterEach(() => {
    uiStore.endNavigation()
  })

  nuxtApp.hook('page:start', () => {
    uiStore.startNavigation()
  })

  nuxtApp.hook('page:finish', () => {
    uiStore.endNavigation()
  })
}
)

