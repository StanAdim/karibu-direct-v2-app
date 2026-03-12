<script setup lang="ts">
import type { RegisterCredentials, UserRole } from '~/types'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const { register, loading } = useAuth()

const credentials = reactive<RegisterCredentials>({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  phone: '',
  role: 'attendee'
})

const errors = reactive<Record<string, string>>({})
const showPassword = ref(false)
const acceptTerms = ref(false)

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  { value: 'attendee', label: 'Attendee', description: 'Browse and attend events' },
  { value: 'organizer', label: 'Organizer', description: 'Create and manage events' }
]

function validateForm(): boolean {
  const newErrors: Record<string, string> = {}

  if (!credentials.firstName.trim()) {
    newErrors.firstName = 'First name is required'
  }

  if (!credentials.lastName.trim()) {
    newErrors.lastName = 'Last name is required'
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

  if (credentials.password !== credentials.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match'
  }

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
    await register(credentials)
  }
  catch {
    credentials.password = ''
    credentials.confirmPassword = ''
  }
}
</script>

<template>
  <div>
    <div class="mb-6 text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        Create an account
      </h1>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Join EventHub to discover and manage events
      </p>
    </div>

    <form
      class="space-y-5"
      @submit.prevent="handleSubmit"
    >
      <!-- Role Selection -->
      <UFormField label="I want to">
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="option in roleOptions"
            :key="option.value"
            type="button"
            :class="[
              'rounded-lg border p-3 text-left transition-colors',
              credentials.role === option.value
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
            ]"
            @click="credentials.role = option.value"
          >
            <span class="block font-medium text-gray-900 dark:text-white">
              {{ option.label }}
            </span>
            <span class="text-xs text-gray-600 dark:text-gray-400">
              {{ option.description }}
            </span>
          </button>
        </div>
      </UFormField>

      <!-- Name -->
      <div class="grid grid-cols-2 gap-4">
        <AppInput
          v-model="credentials.firstName"
          label="First Name"
          placeholder="John"
          icon="i-lucide-user"
          required
          :error="errors.firstName"
        />

        <AppInput
          v-model="credentials.lastName"
          label="Last Name"
          placeholder="Doe"
          required
          :error="errors.lastName"
        />
      </div>

      <!-- Email -->
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

      <!-- Phone -->
      <AppInput
        v-model="credentials.phone"
        type="tel"
        label="Phone (optional)"
        placeholder="+1 234 567 8900"
        icon="i-lucide-phone"
        autocomplete="tel"
      />

      <!-- Password -->
      <div class="relative">
        <AppInput
          v-model="credentials.password"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          placeholder="At least 8 characters"
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

      <!-- Confirm Password -->
      <AppInput
        v-model="credentials.confirmPassword"
        :type="showPassword ? 'text' : 'password'"
        label="Confirm Password"
        placeholder="Confirm your password"
        icon="i-lucide-lock"
        autocomplete="new-password"
        required
        :error="errors.confirmPassword"
      />

      <!-- Terms -->
      <div>
        <label class="flex items-start gap-2">
          <UCheckbox
            v-model="acceptTerms"
            class="mt-0.5"
          />
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

      <AppButton
        type="submit"
        block
        :loading="loading"
        size="lg"
      >
        Create Account
      </AppButton>
    </form>

    <div class="mt-6">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="bg-white px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
            Already have an account?
          </span>
        </div>
      </div>

      <div class="mt-6">
        <NuxtLink to="/login">
          <AppButton
            variant="outline"
            color="neutral"
            block
          >
            Sign in instead
          </AppButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
