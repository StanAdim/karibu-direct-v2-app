<script setup lang="ts">
interface Props {
  status: string
  variant?: 'dot' | 'solid' | 'outline'
  size?: 'xs' | 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'solid',
  size: 'sm'
})

const statusConfig = computed(() => {
  const configs: Record<string, { color: string; label: string }> = {
    active: { color: 'success', label: 'Active' },
    inactive: { color: 'neutral', label: 'Inactive' },
    pending: { color: 'warning', label: 'Pending' },
    suspended: { color: 'error', label: 'Suspended' },

    draft: { color: 'neutral', label: 'Draft' },
    published: { color: 'success', label: 'Published' },
    cancelled: { color: 'error', label: 'Cancelled' },
    completed: { color: 'info', label: 'Completed' },
    archived: { color: 'neutral', label: 'Archived' },

    registered: { color: 'info', label: 'Registered' },
    confirmed: { color: 'primary', label: 'Confirmed' },
    checked_in: { color: 'success', label: 'Checked In' },
    checked_out: { color: 'neutral', label: 'Checked Out' },
    no_show: { color: 'warning', label: 'No Show' },

    valid: { color: 'success', label: 'Valid' },
    used: { color: 'neutral', label: 'Used' },
    expired: { color: 'warning', label: 'Expired' },
    transferred: { color: 'info', label: 'Transferred' },

    scheduled: { color: 'primary', label: 'Scheduled' },
    in_progress: { color: 'success', label: 'In Progress' },

    success: { color: 'success', label: 'Success' },
    failed: { color: 'error', label: 'Failed' },
    duplicate: { color: 'warning', label: 'Duplicate' },
    invalid_ticket: { color: 'error', label: 'Invalid Ticket' },
    capacity_reached: { color: 'warning', label: 'Capacity Reached' }
  }

  return configs[props.status] || { color: 'neutral', label: props.status }
})
</script>

<template>
  <UBadge
    :color="statusConfig.color as 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'primary'"
    :variant="variant"
    :size="size"
  >
    {{ statusConfig.label }}
  </UBadge>
</template>
