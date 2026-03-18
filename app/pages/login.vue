<script setup lang="ts">
import type { LoginCredentials } from '~/types'
import { useNotifications } from '~/composables/useNotifications'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

import AppModal from '~/components/common/AppModal.vue'

const { login, loading } = useAuth()
const router = useRouter()
const { success } = useNotifications()

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  email: '',
  password: ''
})

const forgotPasswordOpen = ref(false)
const resetStep = ref<1 | 2>(1)

const resetForm = reactive({
  email: ''
})

const resetErrors = reactive({
  email: ''
})

const resetLoading = ref(false)

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

function validateResetForm(): boolean {
  resetErrors.email = ''

  if (!resetForm.email) {
    resetErrors.email = 'Email is required'
  }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetForm.email)) {
    resetErrors.email = 'Please enter a valid email'
  }

  return !resetErrors.email
}

function openForgotPassword() {
  resetStep.value = 1
  resetForm.email = form.email || ''
  resetErrors.email = ''
  forgotPasswordOpen.value = true
}

function closeForgotPassword() {
  forgotPasswordOpen.value = false
  resetLoading.value = false
}

async function handleResetSubmit() {
  if (!validateResetForm() || resetLoading.value) return

  resetLoading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 1200))
    resetStep.value = 2
  }
  finally {
    resetLoading.value = false
  }
}

async function handleSubmit() {
  if (!validateForm()) return

  try {
    const credentials: LoginCredentials = {
      email: form.email,
      password: form.password
    }
    const { redirectPath } = await login(credentials)
    success('Logged in successfully')
    if (redirectPath) {
      router.push(redirectPath)
    }
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
<!--    <div class="grid grid-cols-2 gap-4 mb-8">-->
<!--      <SocialLoginButton-->
<!--        provider="google"-->
<!--        :loading="socialLoading === 'google'"-->
<!--        @click="handleSocialLogin('google')"-->
<!--      />-->
<!--      <SocialLoginButton-->
<!--        provider="facebook"-->
<!--        :loading="socialLoading === 'facebook'"-->
<!--        @click="handleSocialLogin('facebook')"-->
<!--      />-->
<!--    </div>-->

    <!-- Divider -->
    <div class="relative mb-8">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-slate-200 dark:border-slate-800" />
      </div>
      <div class="relative flex justify-center text-sm">
<!--        <span class="px-4 bg-white dark:bg-[var(&#45;&#45;color-background-dark)] text-slate-500">Or sign in with email</span>-->
        <span class="px-4 bg-white dark:bg-[var(--color-background-dark)] text-slate-500">Sign in now</span>
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
          <button
            type="button"
            class="text-sm font-semibold text-primary-500 hover:text-primary-500/80 transition-colors"
            @click="openForgotPassword"
          >
            Forgot password?
          </button>
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
      <AppButton
        type="submit"
        block
        :disabled="loading"
      >
        {{ loading ? 'Signing In...' : 'Sign In' }}
      </AppButton>
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

    <AppModal
      v-model="forgotPasswordOpen"
      max-width="xl"
    >
      <div
        v-if="resetStep === 1"
        class="space-y-8"
      >
        <div class="mx-auto flex max-w-md flex-col items-center text-center">
          <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-500 shadow-sm dark:bg-primary-500/10">
            <span class="material-symbols-outlined text-3xl">
              lock_reset
            </span>
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Reset your password
          </h2>
          <p class="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <form
          class="mx-auto flex max-w-md flex-col gap-4"
          @submit.prevent="handleResetSubmit"
        >
          <AppInput
            v-model="resetForm.email"
            type="email"
            label="Email Address"
            placeholder="name@company.com"
            icon="i-lucide-mail"
            autocomplete="email"
            :error="resetErrors.email"
            required
          />

          <AppButton
            type="submit"
            block
            :disabled="resetLoading"
            class="mt-2"
          >
            {{ resetLoading ? 'Sending link...' : 'Send Reset Link' }}
          </AppButton>

          <button
            type="button"
            class="mt-1 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            @click="closeForgotPassword"
          >
            &lt; Back to sign in
          </button>
        </form>
      </div>

      <div
        v-else
        class="space-y-8"
      >
        <div class="mx-auto flex max-w-md flex-col items-center text-center">
          <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-sm dark:bg-emerald-500/10">
            <span class="material-symbols-outlined text-3xl">
              mark_email_unread
            </span>
          </div>

          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
            Step 2 of 2
          </p>

          <h2 class="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Check your email
          </h2>
          <p class="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            We&apos;ve sent a password reset link to
            <span class="font-semibold text-slate-700 dark:text-slate-200">{{ resetForm.email || 'your email address' }}</span>.
            Please check your inbox and follow the instructions.
          </p>

          <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Didn&apos;t receive the email?
            <button
              type="button"
              class="font-semibold text-primary-500 hover:text-primary-500/80"
              @click="handleResetSubmit"
            >
              Resend link
            </button>
          </p>
        </div>

        <div class="mx-auto flex max-w-md flex-col gap-3">
          <AppButton
            type="button"
            block
            color="neutral"
            @click="closeForgotPassword"
          >
            Open Mail App
          </AppButton>

          <button
            type="button"
            class="text-xs text-slate-500 underline-offset-2 hover:underline dark:text-slate-400"
            @click="closeForgotPassword"
          >
            Back to sign in
          </button>
        </div>
      </div>
    </AppModal>
  </div>
</template>
