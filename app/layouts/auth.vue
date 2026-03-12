<script setup lang="ts">
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
    <div class="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div class="w-full max-w-md">
        <div class="mb-8 text-center">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2"
          >
            <span class="text-2xl font-bold text-gray-900 dark:text-white">
              KaribuDirect
            </span>
          </NuxtLink>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <slot />
        </div>

        <p class="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {{ new Date().getFullYear() }} KaribuDirect. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>
