<script setup lang="ts">
import type { RegisterCredentials, UserRole } from '~/types'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const { register, loading } = useAuth()
const router = useRouter()

const credentials = reactive<RegisterCredentials>({
  email: '',
  password: '',
  confirm_password: '',
  first_name: '',
  last_name: '',
  phone: '',
  role: 'Attendee'
})

const errors = reactive<Record<string, string>>({})
const showPassword = ref(false)
const acceptTerms = ref(false)
const socialLoading = ref<string | null>(null)

function validateForm(): boolean {
  const newErrors: Record<string, string> = {}

  if (!credentials.first_name.trim()) {
    newErrors.first_name = 'First name is required'
  }

  if (!credentials.last_name.trim()) {
    newErrors.last_name = 'Last name is required'
  }

  if (!credentials.email) {
    newErrors.email = 'Email is required'
  }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
    newErrors.email = 'Please enter a valid email'
  }

  if (!credentials.password) {
    newErrors.password = 'Password is required'
  }
  else if (credentials.password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters'
  }

  if (!(credentials.phone ?? '').trim()) {
    newErrors.phone = 'Phone number is required'
  }

  // Confirm password is handled implicitly by using the same password value

  if (!acceptTerms.value) {
    newErrors.terms = 'You must accept the terms and conditions'
  }

  Object.assign(errors, newErrors)
  Object.keys(errors).forEach((key) => {
    if (!newErrors[key]) {
      delete errors[key]
    }
  })

  return Object.keys(newErrors).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return

  try {
    credentials.confirm_password = credentials.password
    await register(credentials)
  }
  catch {
    credentials.password = ''
    credentials.confirm_password = ''
  }
}

async function handleSocialSignup(provider: string) {
  socialLoading.value = provider

  try {
    // TODO: Replace with real social sign up flow
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
      <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        Create an account
      </h2>
      <p class="text-slate-500 dark:text-slate-400">
        Join the community and start attending or organizing your events.
      </p>
    </div>

    <form
      class="space-y-6"
      @submit.prevent="handleSubmit"
    >
      <!-- Name -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AppInput
          v-model="credentials.first_name"
          label="First Name"
          placeholder="John"
          icon="i-lucide-user"
          required
          :error="errors.first_name"
        />
        <AppInput
          v-model="credentials.last_name"
          label="Last Name"
          placeholder="Doe"
          icon="i-lucide-user"
          required
          :error="errors.last_name"
        />
      </div>

      <!-- Email -->
      <AppInput
        v-model="credentials.email"
        type="email"
        label="Email Address"
        placeholder="Your email here"
        icon="i-lucide-mail"
        autocomplete="email"
        required
        :error="errors.email"
      />

      <!-- Phone -->
      <AppInput
        v-model="credentials.phone"
        type="tel"
        label="Phone Number"
        placeholder="+255-XXX-XXX-XXX"
        icon="i-lucide-phone"
        autocomplete="tel"
        required
        :error="errors.phone"
      />

      <!-- Password -->
      <div class="relative">
        <AppInput
          v-model="credentials.password"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          placeholder="••••••••"
          icon="i-lucide-lock"
          autocomplete="new-password"
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

      <p class="text-[11px] text-slate-500 dark:text-slate-400 ml-1 italic">
        Must be at least 8 characters with one special symbol.
      </p>

      <!-- Terms -->
      <div>
        <label class="flex items-start gap-2 cursor-pointer">
          <input
            v-model="acceptTerms"
            type="checkbox"
            class="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800"
          >
          <span class="text-sm text-gray-600 dark:text-gray-400">
            I agree to the
            <NuxtLink
              to="/terms"
              class="text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              Terms of Service
            </NuxtLink>
            and
            <NuxtLink
              to="/privacy"
              class="text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              Privacy Policy
            </NuxtLink>
          </span>
        </label>
        <p
          v-if="errors.terms"
          class="mt-1 text-sm text-red-600"
        >
          {{ errors.terms }}
        </p>
      </div>

      <!-- Submit Button -->
      <AppButton
        type="submit"
        block
        :disabled="loading"
        icon="arrow_forward"
        icon-position="right"
      >
        {{ loading ? 'Creating Account...' : 'Create Account' }}
      </AppButton>
    </form>

    <!-- Organizer CTA & Login Link -->
<!--    <div class="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">-->
<!--      <div class="flex flex-col gap-4">-->
<!--        <button-->
<!--          type="button"-->
<!--          class="flex items-center justify-center gap-2 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 group hover:bg-primary-500/20 transition-all text-left"-->
<!--          @click="credentials.role = 'Organizer'"-->
<!--        >-->
<!--          <span class="material-symbols-outlined text-primary-500">campaign</span>-->
<!--          <div class="flex flex-col items-start">-->
<!--            <span class="text-sm font-bold text-slate-900 dark:text-slate-100">-->
<!--              Want to host events?-->
<!--            </span>-->
<!--            <span class="text-xs text-primary-500 font-semibold uppercase tracking-wider group-hover:underline">-->
<!--              Sign up as an organizer-->
<!--            </span>-->
<!--          </div>-->
<!--        </button>-->

<!--        <p class="text-center text-sm text-slate-600 dark:text-slate-400">-->
<!--          Already have an account?-->
<!--          <NuxtLink-->
<!--            to="/login"-->
<!--            class="text-primary-500 font-bold hover:underline"-->
<!--          >-->
<!--            Log in-->
<!--          </NuxtLink>-->
<!--        </p>-->
<!--      </div>-->
<!--    </div>-->

    <!-- Social Signup alternative -->
<!--    <div class="mt-8">-->
<!--      <div class="flex items-center gap-4 mb-6">-->
<!--        <div class="h-px flex-1 bg-slate-200 dark:bg-slate-800" />-->
<!--        <span class="text-xs font-bold text-slate-400 uppercase">-->
<!--          Or continue with-->
<!--        </span>-->
<!--        <div class="h-px flex-1 bg-slate-200 dark:bg-slate-800" />-->
<!--      </div>-->

<!--      <div class="grid grid-cols-2 gap-4">-->
<!--        <SocialLoginButton-->
<!--          provider="google"-->
<!--          :loading="socialLoading === 'google'"-->
<!--          @click="handleSocialSignup('google')"-->
<!--        />-->
<!--        <SocialLoginButton-->
<!--          provider="facebook"-->
<!--          :loading="socialLoading === 'facebook'"-->
<!--          @click="handleSocialSignup('facebook')"-->
<!--        />-->
<!--      </div>-->
<!--    </div>-->
  </div>
</template>
