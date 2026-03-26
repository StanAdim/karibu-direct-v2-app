<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppModal from '~/components/common/AppModal.vue'
import AppButton from '~/components/ui/AppButton.vue'
import { useApi } from '~/composables/useApi'
import type { Session } from '~/types'

type AssignSpeakerPayload = {
  user_id: string
  role: string
}

type OrganizerListUser = {
  id: string
  email: string
  full_name: string
}

const props = defineProps<{
  modelValue: boolean
  session: Session | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: [payload: AssignSpeakerPayload]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const api = useApi()
const selectedUserId = ref<string | null>(null)
const role = ref<string | null>('speaker')
const loadingUsers = ref(false)
const userLoadFailed = ref(false)
const users = ref<OrganizerListUser[]>([])

const speakerRoles = [
  { value: 'speaker', label: 'Speaker' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'host', label: 'Host' },
  { value: 'panelist', label: 'Panelist' }
]

const userOptions = computed(() =>
  users.value.map(user => ({
    value: user.id,
    label: user.full_name || user.email
  }))
)

function normalizeUsers(raw: unknown): OrganizerListUser[] {
  if (Array.isArray(raw)) return raw as OrganizerListUser[]
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>
    if (Array.isArray(o.data)) return o.data as OrganizerListUser[]
    if (Array.isArray(o.results)) return o.results as OrganizerListUser[]
  }
  return []
}

async function fetchUsers() {
  loadingUsers.value = true
  userLoadFailed.value = false
  try {
    const raw = await api.get<unknown>('/users/organizers/list', { suppressErrorToast: true })
    users.value = normalizeUsers(raw)
  }
  catch {
    userLoadFailed.value = true
    users.value = []
  }
  finally {
    loadingUsers.value = false
  }
}

function resetFromSession(s: Session | null) {
  const primary = s?.speakers?.[0]
  selectedUserId.value = primary?.user?.id ?? null
  role.value = primary?.role ?? 'speaker'
}

watch(
  () => [props.modelValue, props.session] as const,
  ([open, s]) => {
    if (open) {
      resetFromSession(s)
      if (!users.value.length) void fetchUsers()
    }
  },
  { immediate: true }
)

function handleCancel() {
  isOpen.value = false
}

function handleSave() {
  if (!selectedUserId.value || !role.value) return
  emit('saved', {
    user_id: selectedUserId.value,
    role: role.value
  })
}
</script>

<template>
  <AppModal
    v-model="isOpen"
    max-width="lg"
    align="top"
  >
    <div class="flex max-h-[80vh] flex-col gap-4 overflow-y-auto">
      <header class="space-y-1">
        <p class="text-sm font-medium uppercase tracking-wide text-primary-600">
          Speaker
        </p>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Assign speaker
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Assign a user to this session with a role.
        </p>
      </header>

      <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
        <AppSingleSelect
          v-model="selectedUserId"
          label="USER"
          :placeholder="loadingUsers ? 'Loading users...' : 'Select user'"
          :options="userOptions"
          searchable
          search-placeholder="Search users..."
          :disabled="loadingUsers || !userOptions.length"
          :show-selected-chip="false"
          class="[&_.ml-1]:text-xs [&_.ml-1]:uppercase [&_.ml-1]:tracking-wide"
        />
        <p
          v-if="userLoadFailed"
          class="-mt-2 text-xs text-red-500"
        >
          Failed to load users.
        </p>
        <p
          v-else-if="!loadingUsers && !userOptions.length"
          class="-mt-2 text-xs text-slate-500 dark:text-slate-400"
        >
          No users available.
        </p>
        <AppSingleSelect
          v-model="role"
          label="ROLE"
          placeholder="Select role"
          :options="speakerRoles"
          :show-selected-chip="false"
          class="[&_.ml-1]:text-xs [&_.ml-1]:uppercase [&_.ml-1]:tracking-wide"
        />
      </div>

      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          @click="handleCancel"
        >
          Cancel
        </button>
        <AppButton
          type="button"
          :loading="loading"
          :disabled="!selectedUserId || !role"
          @click="handleSave"
        >
          Save
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
