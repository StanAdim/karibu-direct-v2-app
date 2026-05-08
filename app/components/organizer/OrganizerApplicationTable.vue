<script setup lang="ts">
import type { OrganizationProfile } from '~/types/organizer'

const props = defineProps<{
  rows: OrganizationProfile[]
  loading?: boolean
  applicantByUserId: Record<string, string>
  reviewerByUserId: Record<string, string>
  sortKey: 'created_at' | 'organization_name'
  sortDir: 'asc' | 'desc'
}>()

const emit = defineEmits<{
  'update:sortKey': [v: 'created_at' | 'organization_name']
  'update:sortDir': [v: 'asc' | 'desc']
  rowClick: [row: OrganizationProfile]
}>()

function toggleSort(key: 'created_at' | 'organization_name'): void {
  if (props.sortKey === key) {
    emit('update:sortDir', props.sortDir === 'asc' ? 'desc' : 'asc')
  }
  else {
    emit('update:sortKey', key)
    emit('update:sortDir', key === 'created_at' ? 'desc' : 'asc')
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  catch {
    return iso
  }
}

function applicantLabel(row: OrganizationProfile): string {
  return props.applicantByUserId[row.user_id] || '…'
}

function reviewerLabel(row: OrganizationProfile): string {
  if (!row.reviewed_by) return '—'
  return props.reviewerByUserId[row.reviewed_by] || '…'
}
</script>

<template>
  <div class="space-y-3">
    <!-- Desktop -->
    <div class="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 dark:bg-slate-800/80 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-4 py-3">
              <button
                type="button"
                class="inline-flex items-center gap-1 font-bold hover:text-primary-600"
                @click="toggleSort('organization_name')"
              >
                Organization
                <AppLucideIcon
                  :name="sortKey === 'organization_name' ? (sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'"
                  class="text-base opacity-60"
                />
              </button>
            </th>
            <th class="px-4 py-3">
              Applicant
            </th>
            <th class="px-4 py-3">
              Status
            </th>
            <th class="px-4 py-3">
              <button
                type="button"
                class="inline-flex items-center gap-1 font-bold hover:text-primary-600"
                @click="toggleSort('created_at')"
              >
                Submitted
                <AppLucideIcon
                  :name="sortKey === 'created_at' ? (sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'"
                  class="text-base opacity-60"
                />
              </button>
            </th>
            <th class="px-4 py-3">
              Reviewed by
            </th>
            <th class="px-4 py-3 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td
              colspan="6"
              class="px-4 py-10 text-center text-slate-500"
            >
              <span class="inline-flex items-center gap-2">
                <span class="size-4 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                Loading…
              </span>
            </td>
          </tr>
          <tr
            v-for="row in rows"
            v-else
            :key="row.id"
            class="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer"
            @click="emit('rowClick', row)"
          >
            <td class="px-4 py-3 font-semibold text-slate-900 dark:text-white">
              {{ row.organization_name }}
            </td>
            <td class="px-4 py-3 text-slate-600 dark:text-slate-300">
              {{ applicantLabel(row) }}
            </td>
            <td class="px-4 py-3">
              <OrganizationStatusBadge
                :status="row.status"
                size="sm"
              />
            </td>
            <td class="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
              {{ formatDate(row.created_at) }}
            </td>
            <td class="px-4 py-3 text-slate-600 dark:text-slate-300">
              {{ reviewerLabel(row) }}
            </td>
            <td
              class="px-4 py-3 text-right"
              @click.stop
            >
              <AppButton
                size="sm"
                color="neutral"
                type="button"
                @click="emit('rowClick', row)"
              >
                Open
              </AppButton>
            </td>
          </tr>
          <tr v-if="!loading && rows.length === 0">
            <td
              colspan="6"
              class="px-4 py-10 text-center text-slate-500"
            >
              No applications match your filters.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile -->
    <div class="md:hidden space-y-3">
      <div
        v-if="loading"
        class="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-500"
      >
        Loading…
      </div>
      <button
        v-for="row in rows"
        v-else
        :key="row.id"
        type="button"
        class="w-full text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
        @click="emit('rowClick', row)"
      >
        <div class="flex items-start justify-between gap-2">
          <p class="font-bold text-slate-900 dark:text-white">
            {{ row.organization_name }}
          </p>
          <OrganizationStatusBadge
            :status="row.status"
            size="sm"
          />
        </div>
        <p class="text-xs text-slate-500 mt-2">
          Applicant: {{ applicantLabel(row) }}
        </p>
        <p class="text-xs text-slate-500">
          Submitted {{ formatDate(row.created_at) }}
        </p>
      </button>
    </div>
  </div>
</template>
