import type { Ref } from 'vue'
import { ref } from 'vue'
import { useApi } from '~/composables/useApi'
import { unwrapResource } from '~/utils/unwrapApiResource'

export interface CheckoutOrderItem {
  id: string
  ticket_type_id: string
  quantity: number
  unit_price: number
  total: number
}

export interface CheckoutOrderPayload {
  id: string
  event_id: string
  status: string
  subtotal: number
  fees: number
  total: number
  currency: string
  expires_at: string
  items: CheckoutOrderItem[]
  payments?: { id: string; provider: string; status: string; transaction_reference: string | null; paid_at: string | null }[]
}

export function useCheckout() {
  const api = useApi()
  const order = ref<CheckoutOrderPayload | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchOrder(orderId: string): Promise<CheckoutOrderPayload | null> {
    loading.value = true
    error.value = null
    try {
      const raw = await api.get<unknown>(`/orders/${orderId}`)
      const data = unwrapResource<CheckoutOrderPayload>(raw)
      order.value = data ?? null
      return order.value
    }
    catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message?: string }).message) : 'Failed to load order'
      error.value = msg
      order.value = null
      return null
    }
    finally {
      loading.value = false
    }
  }

  async function initiatePayment(orderId: string, provider: string, idempotencyKey?: string) {
    return await api.post<{ data?: { instructions?: Record<string, unknown> } }>('/payments/initiate', {
      order_id: orderId,
      provider,
      idempotency_key: idempotencyKey,
    })
  }

  return {
    order: order as Ref<CheckoutOrderPayload | null>,
    loading,
    error,
    fetchOrder,
    initiatePayment,
  }
}
