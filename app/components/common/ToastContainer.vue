<script setup lang="ts">
import { useAppToast } from '~/composables/useAppToast'
import ToastItem from '~/components/common/ToastItem.vue'

const { toasts, remove } = useAppToast()
</script>

<template>
  <div class="pointer-events-none fixed top-5 right-5 z-[9999] flex flex-col items-end gap-3">
    <TransitionGroup
      name="toast-slide"
      tag="div"
      class="flex flex-col items-end gap-3"
    >
      <ToastItem
        v-for="toast in toasts"
        :key="toast.id"
        :toast="toast"
        @close="remove"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.2s ease-out;
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(16px) translateY(8px);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(16px) translateY(-8px);
}

.toast-slide-move {
  transition: transform 0.2s ease-out;
}
</style>

