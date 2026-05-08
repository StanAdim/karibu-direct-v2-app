<script setup lang="ts">
import type { AdminReviewAction } from '~/types/organizer'

const props = defineProps<{
  modelValue: boolean
  loading?: boolean
  organizationName?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  submit: [payload: { action: AdminReviewAction; comment: string }]
}>()

const action = ref<AdminReviewAction>('APPROVE')
const comment = ref('')

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      action.value = 'APPROVE'
      comment.value = ''
    }
  }
)

function close(): void {
  emit('update:modelValue', false)
}

function submit(): void {
  emit('submit', {
    action: action.value,
    comment: comment.value.trim()
  })
}

const needsComment = computed(
  () => action.value === 'REJECT' || action.value === 'REQUEST_CHANGES'
)

const canSubmit = computed(() => {
  if (!needsComment.value) return true
  return comment.value.trim().length > 0
})
</script>

<template>
  <AppModal
    :model-value="modelValue"
    max-width="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
      <h2
        id="review-modal-title"
        class="text-lg font-bold text-slate-900 dark:text-white"
      >
        Review application
      </h2>
      <p
        v-if="organizationName"
        class="text-sm text-slate-600 dark:text-slate-400 mt-1"
      >
        {{ organizationName }}
      </p>

      <div
        class="mt-5 space-y-3"
        role="group"
        aria-labelledby="review-modal-title"
      >
        <label class="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3 cursor-pointer">
          <input
            v-model="action"
            type="radio"
            value="APPROVE"
            class="text-primary-600"
          >
          <span class="text-sm font-medium text-slate-900 dark:text-white">Approve</span>
        </label>
        <label class="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3 cursor-pointer">
          <input
            v-model="action"
            type="radio"
            value="REQUEST_CHANGES"
            class="text-primary-600"
          >
          <span class="text-sm font-medium text-slate-900 dark:text-white">Request changes</span>
        </label>
        <label class="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3 cursor-pointer">
          <input
            v-model="action"
            type="radio"
            value="REJECT"
            class="text-primary-600"
          >
          <span class="text-sm font-medium text-slate-900 dark:text-white">Reject</span>
        </label>
      </div>

      <div class="mt-4">
        <label
          for="review-comment"
          class="text-xs font-bold uppercase tracking-wide text-slate-500"
        >
          Comment
          <span
            v-if="needsComment"
            class="text-red-500"
          >*</span>
        </label>
        <textarea
          id="review-comment"
          v-model="comment"
          rows="4"
          :required="needsComment"
          class="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 outline-none"
          :placeholder="needsComment ? 'Required for this action' : 'Optional note for the applicant'"
        />
      </div>

      <div class="mt-6 flex flex-wrap gap-2 justify-end">
        <AppButton
          color="neutral"
          type="button"
          @click="close"
        >
          Cancel
        </AppButton>
        <AppButton
          type="button"
          :disabled="!canSubmit || loading"
          @click="submit"
        >
          {{ loading ? 'Saving…' : 'Submit review' }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
