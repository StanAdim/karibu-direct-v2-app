import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const pendingRequests = ref(0)
  const navigationLoading = ref(false)

  const isAppLoading = computed<boolean>(() => {
    return navigationLoading.value || pendingRequests.value > 0
  })

  const startRequest = (): void => {
    pendingRequests.value += 1
  }

  const endRequest = (): void => {
    pendingRequests.value = Math.max(0, pendingRequests.value - 1)
  }

  const startNavigation = (): void => {
    navigationLoading.value = true
  }

  const endNavigation = (): void => {
    navigationLoading.value = false
  }

  return {
    // state
    pendingRequests,
    navigationLoading,

    // getters
    isAppLoading,

    // actions
    startRequest,
    endRequest,
    startNavigation,
    endNavigation
  }
})

