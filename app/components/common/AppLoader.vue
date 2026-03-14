<script setup lang="ts">
const appName = 'EventHub'
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-slate-950/95"
    aria-busy="true"
    aria-live="polite"
    role="status"
  >
    <main
      class="relative flex flex-col items-center justify-center w-full max-w-md px-6 text-center"
      data-purpose="app-loader-screen"
    >
      <!-- Logo + circular animation -->
      <div
        class="relative flex items-center justify-center mb-8"
        data-purpose="branding-animation"
      >
        <!-- Outer rotating ring -->
        <svg
          class="w-32 h-32 animate-spin-custom text-primary-500"
          viewBox="0 0 50 50"
        >
          <circle
            class="loading-ring-circle"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
          />
        </svg>

        <!-- Inner icon -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div
            class="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center border border-slate-100/80 dark:border-slate-800 animate-breath"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 8V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V8"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <path
                d="M4 8V6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V8"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <path
                d="M4 8H20"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              />
              <path
                d="M9 12H15"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M9 15H13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M8 4V6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M16 4V6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Text + dots -->
      <div
        class="fade-in-up"
        data-purpose="loading-message"
      >
        <div class="flex items-center justify-center space-x-1.5 mb-3">
          <div
            class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-dot-pulse"
          />
          <div
            class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-dot-pulse animation-delay-200"
          />
          <div
            class="w-1.5 h-1.5 rounded-full bg-primary-500 animate-dot-pulse animation-delay-400"
          />
        </div>

        <h1 class="text-slate-800 dark:text-slate-100 text-xl font-semibold tracking-tight mb-2">
          {{ appName }}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide">
          Preparing your next experience...
        </p>
      </div>
    </main>
  </div>
</template>

