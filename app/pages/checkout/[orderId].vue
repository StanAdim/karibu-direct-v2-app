<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppButton from '~/components/ui/AppButton.vue'

definePageMeta({
  layout: 'attendee',
  middleware: 'attendee',
})

const route = useRoute()
const router = useRouter()
const notifications = useNotifications()
const { order, loading, error, fetchOrder, initiatePayment } = useCheckout()
const registrationStore = useRegistrationStore()

const orderId = computed(() => String(route.params.orderId ?? ''))
const paying = ref(false)
const pollTimer = ref<ReturnType<typeof setInterval> | null>(null)

const expiresAt = computed(() => (order.value?.expires_at ? new Date(order.value.expires_at) : null))
const secondsLeft = ref<number | null>(null)

function tickTimer() {
  if (!expiresAt.value) {
    secondsLeft.value = null
    return
  }
  const s = Math.max(0, Math.floor((expiresAt.value.getTime() - Date.now()) / 1000))
  secondsLeft.value = s
}

function formatMmSs(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

async function refresh() {
  await fetchOrder(orderId.value)
  tickTimer()
  if (order.value?.status === 'paid') {
    notifications.success('Payment confirmed — your tickets are ready.')
    await registrationStore.fetchUserRegistrations()
    await router.replace('/attendee/tickets')
  }
}

async function onPayStub() {
  if (!orderId.value) return
  paying.value = true
  try {
    await initiatePayment(orderId.value, 'stub')
    notifications.info('Use the dev webhook or admin tools to complete stub payments.')
  }
  catch {
    notifications.error('Could not start payment')
  }
  finally {
    paying.value = false
  }
}

function startPolling() {
  stopPolling()
  pollTimer.value = setInterval(() => {
    void refresh()
  }, 4000)
}

function stopPolling() {
  if (pollTimer.value) {
    clearInterval(pollTimer.value)
    pollTimer.value = null
  }
}

watch(orderId, () => void refresh(), { immediate: true })

const countdownIv = ref<ReturnType<typeof setInterval> | null>(null)
onMounted(() => {
  startPolling()
  countdownIv.value = setInterval(tickTimer, 1000)
  tickTimer()
})

onBeforeUnmount(() => {
  stopPolling()
  if (countdownIv.value) clearInterval(countdownIv.value)
})

const statusLabel = computed(() => {
  const s = order.value?.status
  if (s === 'pending') return 'Awaiting payment'
  if (s === 'paid') return 'Paid'
  if (s === 'expired') return 'Reservation expired'
  if (s === 'cancelled') return 'Cancelled'
  return s || '—'
})
</script>

<template>
  <div class="max-w-lg mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
      Checkout
    </h1>
    <p class="text-sm text-slate-600 dark:text-slate-400 mb-6">
      Complete payment to confirm your seats. Inventory is held until the timer ends.
    </p>

    <div v-if="loading && !order" class="py-12 flex justify-center">
      <LoadingState text="Loading order…" />
    </div>
    <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
      {{ error }}
    </div>
    <div v-else-if="order" class="space-y-6">
      <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 p-5 shadow-sm">
        <div class="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-1">
          <span>Status</span>
          <span class="font-semibold text-slate-800 dark:text-slate-100">{{ statusLabel }}</span>
        </div>
        <div
          v-if="order.status === 'pending' && secondsLeft != null"
          class="mt-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-sm text-amber-900 dark:text-amber-100"
        >
          Reservation expires in <strong>{{ formatMmSs(secondsLeft) }}</strong>
        </div>
        <div class="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div v-for="it in order.items" :key="it.id" class="flex justify-between text-sm">
            <span>{{ it.quantity }}× ticket</span>
            <span>{{ it.total.toLocaleString() }} {{ order.currency }}</span>
          </div>
          <div class="flex justify-between font-semibold pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Total</span>
            <span>{{ order.total.toLocaleString() }} {{ order.currency }}</span>
          </div>
        </div>
      </div>

      <div v-if="order.status === 'pending'" class="flex flex-col gap-3">
        <AppButton
          variant="primary"
          class="w-full"
          :loading="paying"
          @click="onPayStub"
        >
          Pay (development stub)
        </AppButton>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          In development, complete the flow by calling the stub webhook with this order id, or retry after wiring your payment provider.
        </p>
      </div>
    </div>
  </div>
</template>
