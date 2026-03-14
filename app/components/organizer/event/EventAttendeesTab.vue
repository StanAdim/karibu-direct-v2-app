<script setup lang="ts">
import type { Participant, ParticipantStatus } from '~/types'
import { getParticipantFullName, getStatusColor, getStatusLabel } from '~/types'

const props = defineProps<{
  participants: Participant[]
}>()

const searchQuery = ref('')
const selectedStatus = ref<ParticipantStatus | ''>('')

const filteredParticipants = computed(() => {
  return props.participants.filter((p) => {
    const matchesSearch = !searchQuery.value ||
      getParticipantFullName(p).toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus = !selectedStatus.value || p.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

const stats = computed(() => ({
  total: props.participants.length,
  checkedIn: props.participants.filter(p => p.status === 'checked_in').length,
  pending: props.participants.filter(p => p.status === 'registered' || p.status === 'confirmed').length
}))

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'registered', label: 'Registered' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' }
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">
          Attendee List
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Directory of everyone registered for this event with live check-in status.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          variant="outline"
          icon="i-lucide-download"
        >
          Export CSV
        </UButton>
        <UButton icon="i-lucide-plus">
          Add Attendee
        </UButton>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <UCard>
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950">
            <UIcon
              name="i-lucide-users"
              class="h-5 w-5 text-primary-600"
            />
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ stats.total }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Total Attendees
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950">
            <UIcon
              name="i-lucide-user-check"
              class="h-5 w-5 text-emerald-600"
            />
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ stats.checkedIn }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Checked In
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950">
            <UIcon
              name="i-lucide-clock"
              class="h-5 w-5 text-amber-600"
            />
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ stats.pending }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Pending Confirmation
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <UCard>
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-64">
          <UInput
            v-model="searchQuery"
            placeholder="Search by name or email..."
            icon="i-lucide-search"
          />
        </div>

        <USelect
          v-model="selectedStatus"
          :items="statusOptions"
          value-key="value"
          label-key="label"
          placeholder="Filter by status"
          class="w-40"
        />
      </div>
    </UCard>

    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead class="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          <tr>
            <th class="px-4 py-3 text-left">
              Attendee
            </th>
            <th class="px-4 py-3 text-left">
              Ticket
            </th>
            <th class="px-4 py-3 text-left">
              Status
            </th>
            <th class="px-4 py-3 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white text-sm dark:divide-gray-800 dark:bg-gray-950">
          <tr v-if="filteredParticipants.length === 0">
            <td
              colspan="4"
              class="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
            >
              No attendees match your current filters.
            </td>
          </tr>
          <tr
            v-for="participant in filteredParticipants"
            :key="participant.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <td class="px-4 py-4">
              <div class="flex items-center gap-3">
                <UAvatar
                  :alt="getParticipantFullName(participant)"
                  size="sm"
                />
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ getParticipantFullName(participant) }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ participant.email }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-4 py-4">
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ participant.ticket.ticket_type.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ participant.ticket.ticket_number }}
                </p>
              </div>
            </td>
            <td class="px-4 py-4">
              <UBadge
                :color="getStatusColor(participant.status) as 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'primary'"
                variant="soft"
              >
                {{ getStatusLabel(participant.status) }}
              </UBadge>
            </td>
            <td class="px-4 py-4">
              <div class="flex items-center justify-end gap-2">
                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-lucide-eye"
                />
                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-lucide-more-horizontal"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

