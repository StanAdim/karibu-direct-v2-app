<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useUiStore } from './stores/ui'

const authStore = useAuthStore()
const uiStore = useUiStore()

onMounted(async () => {
  await authStore.initAuth()
})
</script>

<template>
  <div class="relative">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UToaster />

    <AppLoader v-if="uiStore.isAppLoading" />
  </div>
</template>
