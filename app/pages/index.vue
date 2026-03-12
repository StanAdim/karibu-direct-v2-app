<script setup lang="ts">
definePageMeta({
  layout: false
})

const { isAuthenticated } = useAuth()

onMounted(() => {
  if (isAuthenticated.value) {
    navigateTo('/dashboard')
  }
  else {
    navigateTo('/login')
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <UIcon
      name="i-lucide-loader-2"
      class="size-8 animate-spin text-primary-500"
    />
  </div>
</template>
