<script setup lang="ts">
import type { LoginCredentials } from '~/types'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const { login, loading } = useAuth()

const credentials = reactive<LoginCredentials>({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const showPassword = ref(false)

function validateForm(): boolean {
  errors.email = ''
  errors.password = ''

  if (!credentials.email) {
    errors.email = 'Email is required'
  }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
    errors.email = 'Please enter a valid email'
  }

  if (!credentials.password) {
    errors.password = 'Password is required'
  }
  else if (credentials.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  return !errors.email && !errors.password
}

async function handleSubmit() {
  if (!validateForm()) return

  try {
    await login(credentials)
  }
  catch {
    credentials.password = ''
  }
}
</script>

<template>
  <div>
    <div class="mb-6 text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Welcome back
      </h1>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Sign in to your account to continue
      </p>
    </div>

    <form
      class="space-y-5"
      @submit.prevent="handleSubmit"
    >
      <AppInput
        v-model="credentials.email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        icon="i-lucide-mail"
        autocomplete="email"
        required
        :error="errors.email"
      />

      <div class="relative">
        <AppInput
          v-model="credentials.password"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          placeholder="Enter your password"
          icon="i-lucide-lock"
          autocomplete="current-password"
          required
          :error="errors.password"
        />
        <button
          type="button"
          class="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          @click="showPassword = !showPassword"
        >
          <UIcon
            :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            class="size-5"
          />
        </button>
      </div>

      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2">
          <UCheckbox />
          <span class="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
        </label>
        <NuxtLink
          to="/forgot-password"
          class="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
        >
          Forgot password?
        </NuxtLink>
      </div>

      <AppButton
        type="submit"
        block
        :loading="loading"
        size="lg"
      >
        Sign in
      </AppButton>
    </form>

    <div class="mt-6">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="bg-white px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
            Don't have an account?
          </span>
        </div>
      </div>

      <div class="mt-6">
        <NuxtLink to="/register">
          <AppButton
            variant="outline"
            color="neutral"
            block
          >
            Create an account
          </AppButton>
        </NuxtLink>
      </div>
    </div>

    <div class="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
      <p class="text-sm text-blue-800 dark:text-blue-200">
        <strong>Demo credentials:</strong><br>
        Email: demo@example.com<br>
        Password: password123
      </p>
    </div>
  </div>
</template>
