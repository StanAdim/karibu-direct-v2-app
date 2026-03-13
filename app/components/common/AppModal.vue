<script setup lang="ts">
interface Props {
  modelValue: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  align?: 'center' | 'top'
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 'xl',
  align: 'center'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
    if (!value) {
      emit('close')
    }
  }
})

const maxWidthClass = computed(() => {
  switch (props.maxWidth) {
    case 'sm':
      return 'max-w-md'
    case 'md':
      return 'max-w-lg'
    case 'lg':
      return 'max-w-2xl'
    case '2xl':
      return 'max-w-3xl'
    case 'xl':
    default:
      return 'max-w-xl md:max-w-2xl lg:max-w-3xl'
  }
})

const alignmentClass = computed(() => {
  return props.align === 'top' ? 'items-start pt-10' : 'items-center'
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex justify-center px-4 sm:px-6 lg:px-8"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="isOpen = false"
        />

        <!-- Modal wrapper -->
        <div
          :class="[
            'relative z-10 flex min-h-screen w-full',
            alignmentClass
          ]"
          @click.self="isOpen = false"
        >
          <div
            :class="[
              'mx-auto w-full',
              maxWidthClass
            ]"
          >
            <div
              class="relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:bg-slate-900/95 dark:ring-white/10"
            >
              <button
                type="button"
                class="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm ring-1 ring-slate-200/80 transition hover:bg-slate-50 hover:text-slate-700 dark:bg-slate-800/90 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700"
                aria-label="Close"
                @click="isOpen = false"
              >
                <span class="material-symbols-outlined text-base">
                  close
                </span>
              </button>

              <div class="p-6 sm:p-8 lg:p-10">
                <slot />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

