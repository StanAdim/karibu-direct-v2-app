<script setup lang="ts">
import type { LoginCredentials } from '~/types'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const { login, loading } = useAuth()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  email: '',
  password: ''
})

const showPassword = ref(false)
const socialLoading = ref<string | null>(null)

function validateForm(): boolean {
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = 'Email is required'
  }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email'
  }

  if (!form.password) {
    errors.password = 'Password is required'
  }
  else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  return !errors.email && !errors.password
}

async function handleSubmit() {
  if (!validateForm()) return

  try {
    const credentials: LoginCredentials = {
      email: form.email,
      password: form.password
    }
    await login(credentials)
  }
  catch {
    form.password = ''
  }
}

async function handleSocialLogin(provider: string) {
  socialLoading.value = provider
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    router.push('/attendee')
  }
  finally {
    socialLoading.value = null
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-10 text-center lg:text-left">
      <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Welcome Back</h2>
      <p class="text-slate-500 dark:text-slate-400">Please enter your details to sign in.</p>
    </div>

    <!-- Social Login Buttons -->
    <div class="grid grid-cols-2 gap-4 mb-8">
      <SocialLoginButton
        provider="google"
        :loading="socialLoading === 'google'"
        @click="handleSocialLogin('google')"
      />
      <SocialLoginButton
        provider="facebook"
        :loading="socialLoading === 'facebook'"
        @click="handleSocialLogin('facebook')"
      />
    </div>

    <!-- Divider -->
    <div class="relative mb-8">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-slate-200 dark:border-slate-800" />
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-4 bg-white dark:bg-[var(--color-background-dark)] text-slate-500">Or sign in with email</span>
      </div>
    </div>

    <!-- Login Form -->
    <form class="space-y-6" @submit.prevent="handleSubmit">
      <!-- Email -->
      <AppInput
        v-model="form.email"
        type="text"
        label="Email or Phone"
        placeholder="name@example.com"
        :error="errors.email"
      />

      <!-- Password -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Password
          </span>
          <NuxtLink
            to="/forgot-password"
            class="text-sm font-semibold text-primary-500 hover:text-primary-500/80 transition-colors"
          >
            Forgot password?
          </NuxtLink>
        </div>
        <div class="relative">
          <AppInput
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            :error="errors.password"
          />
          <button
            type="button"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            @click="showPassword = !showPassword"
          >
            <span class="material-symbols-outlined text-lg">
              {{ showPassword ? 'visibility_off' : 'visibility' }}
            </span>
          </button>
        </div>
      </div>

      <!-- Remember Me -->
      <UFormField
        orientation="vertical"
        size="md"
      >
        <label class="flex items-center">
          <UCheckbox
            v-model="form.rememberMe"
            class="size-4 text-primary-500 border-slate-300 dark:border-slate-700 rounded focus:ring-primary-500"
          />
          <span class="ml-2 block text-sm text-slate-700 dark:text-slate-300">
            Remember me for 30 days
          </span>
        </label>
      </UFormField>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-primary-500 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-primary-500/20 hover:bg-primary-500/90 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Signing In...' : 'Sign In' }}
      </button>
    </form>

    <!-- Sign Up Link -->
    <p class="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
      Don't have an account?
      <NuxtLink
        to="/register"
        class="font-bold text-primary-500 hover:text-primary-500/80 transition-colors"
      >
        Sign up for free
      </NuxtLink>
    </p>

    <!-- Demo Credentials -->
    <div class="mt-6 rounded-xl border border-primary-500/20 bg-primary-500/5 p-4">
      <p class="text-sm text-slate-600 dark:text-slate-400">
        <strong class="text-primary-500">Demo credentials:</strong><br>
        Email: demo@example.com<br>
        Password: password123
      </p>
    </div>
  </div>
</template>
