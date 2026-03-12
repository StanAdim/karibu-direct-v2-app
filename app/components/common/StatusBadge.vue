<script setup lang="ts">
type StatusType =
  | 'active' | 'on-sale' | 'selling-fast' | 'sold-out' | 'draft' | 'cancelled' | 'pending'
  | 'inactive' | 'published' | 'completed' | 'archived'
  | 'registered' | 'confirmed' | 'checked_in' | 'checked_out' | 'no_show'
  | 'valid' | 'used' | 'expired' | 'transferred'
  | 'scheduled' | 'in_progress'
  | 'success' | 'failed' | 'duplicate' | 'invalid_ticket' | 'capacity_reached'

interface Props {
  status: StatusType | string
  variant?: 'dot' | 'solid' | 'outline'
  size?: 'xs' | 'sm' | 'md'
  showDot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'solid',
  size: 'sm',
  showDot: true
})

interface StatusConfigItem {
  label: string
  bgClass: string
  dotClass: string
  color: string
}

const statusConfig: Record<string, StatusConfigItem> = {
  'active': { label: 'Active', bgClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dotClass: 'bg-emerald-500', color: 'success' },
  'on-sale': { label: 'On Sale', bgClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dotClass: 'bg-emerald-500', color: 'success' },
  'selling-fast': { label: 'Selling Fast', bgClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dotClass: 'bg-amber-500', color: 'warning' },
  'sold-out': { label: 'Sold Out', bgClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dotClass: 'bg-red-500', color: 'error' },
  'draft': { label: 'Draft', bgClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', dotClass: 'bg-slate-500', color: 'neutral' },
  'cancelled': { label: 'Cancelled', bgClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dotClass: 'bg-red-500', color: 'error' },
  'pending': { label: 'Pending', bgClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dotClass: 'bg-amber-500', color: 'warning' },
  'inactive': { label: 'Inactive', bgClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', dotClass: 'bg-slate-500', color: 'neutral' },
  'suspended': { label: 'Suspended', bgClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dotClass: 'bg-red-500', color: 'error' },
  'published': { label: 'Published', bgClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dotClass: 'bg-emerald-500', color: 'success' },
  'completed': { label: 'Completed', bgClass: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', dotClass: 'bg-sky-500', color: 'info' },
  'archived': { label: 'Archived', bgClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', dotClass: 'bg-slate-500', color: 'neutral' },
  'registered': { label: 'Registered', bgClass: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', dotClass: 'bg-sky-500', color: 'info' },
  'confirmed': { label: 'Confirmed', bgClass: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400', dotClass: 'bg-primary-500', color: 'primary' },
  'checked_in': { label: 'Checked In', bgClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dotClass: 'bg-emerald-500', color: 'success' },
  'checked_out': { label: 'Checked Out', bgClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', dotClass: 'bg-slate-500', color: 'neutral' },
  'no_show': { label: 'No Show', bgClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dotClass: 'bg-amber-500', color: 'warning' },
  'valid': { label: 'Valid', bgClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dotClass: 'bg-emerald-500', color: 'success' },
  'used': { label: 'Used', bgClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', dotClass: 'bg-slate-500', color: 'neutral' },
  'expired': { label: 'Expired', bgClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dotClass: 'bg-amber-500', color: 'warning' },
  'transferred': { label: 'Transferred', bgClass: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', dotClass: 'bg-sky-500', color: 'info' },
  'scheduled': { label: 'Scheduled', bgClass: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400', dotClass: 'bg-primary-500', color: 'primary' },
  'in_progress': { label: 'In Progress', bgClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dotClass: 'bg-emerald-500', color: 'success' },
  'success': { label: 'Success', bgClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dotClass: 'bg-emerald-500', color: 'success' },
  'failed': { label: 'Failed', bgClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dotClass: 'bg-red-500', color: 'error' },
  'duplicate': { label: 'Duplicate', bgClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dotClass: 'bg-amber-500', color: 'warning' },
  'invalid_ticket': { label: 'Invalid Ticket', bgClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dotClass: 'bg-red-500', color: 'error' },
  'capacity_reached': { label: 'Capacity Reached', bgClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dotClass: 'bg-amber-500', color: 'warning' }
}

const config = computed(() => {
  return statusConfig[props.status] || {
    label: props.status,
    bgClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    dotClass: 'bg-slate-500',
    color: 'neutral'
  }
})

const sizeClasses = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm'
}

const dotSizeClasses = {
  xs: 'size-1',
  sm: 'size-1.5',
  md: 'size-2'
}
</script>

<template>
  <!-- Custom styled badge for dot variant -->
  <span
    v-if="showDot && variant === 'solid'"
    :class="[
      'inline-flex items-center gap-1.5 rounded-full font-bold',
      config.bgClass,
      sizeClasses[size]
    ]"
  >
    <span :class="['rounded-full', config.dotClass, dotSizeClasses[size]]" />
    {{ config.label }}
  </span>

  <!-- Fallback to UBadge for other variants -->
  <UBadge
    v-else
    :color="config.color as 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'primary'"
    :variant="variant"
    :size="size"
  >
    {{ config.label }}
  </UBadge>
</template>
