<script setup lang="ts">
const props = defineProps<{
  currentStep: number
  maxReachedStep: number
  steps: { id: string; title: string }[]
}>()

const emit = defineEmits<{
  goToStep: [step: number]
}>()

const progress = computed(() => {
  if (props.steps.length <= 1) return 100
  return Math.round(((props.currentStep - 1) / (props.steps.length - 1)) * 100)
})

function onStepClick(index1: number): void {
  if (index1 > props.maxReachedStep) return
  emit('goToStep', index1)
}

function stepTabindex(stepNum: number): number {
  return stepNum <= props.maxReachedStep ? 0 : -1
}
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-between gap-2 mb-2">
      <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Step {{ currentStep }} of {{ steps.length }}
      </span>
      <span class="text-xs font-semibold text-primary-600 dark:text-primary-400">
        {{ progress }}%
      </span>
    </div>
    <div
      class="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"
      role="progressbar"
      :aria-valuenow="progress"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="h-full rounded-full bg-primary-500 transition-all duration-300"
        :style="{ width: `${progress}%` }"
      />
    </div>
    <ol
      class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2"
      aria-label="Application steps"
    >
      <li
        v-for="(s, i) in steps"
        :key="s.id"
      >
        <button
          type="button"
          class="w-full rounded-xl px-2 py-2 text-center text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          :class="
            i + 1 === currentStep
              ? 'border-primary-500 bg-primary-500/15 text-primary-700 dark:text-primary-300 ring-1 ring-primary-500/30'
              : i + 1 <= maxReachedStep
                ? 'border-primary-500/40 bg-primary-500/10 text-primary-700 dark:text-primary-300 cursor-pointer hover:bg-primary-500/15'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-70'
          "
          :disabled="i + 1 > maxReachedStep"
          :tabindex="stepTabindex(i + 1)"
          :aria-current="i + 1 === currentStep ? 'step' : undefined"
          @click="onStepClick(i + 1)"
        >
          <span class="block truncate">{{ s.title }}</span>
        </button>
      </li>
    </ol>
  </div>
</template>
