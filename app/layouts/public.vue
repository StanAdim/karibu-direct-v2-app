<script setup lang="ts">
import ToastContainer from '~/components/common/ToastContainer.vue'

interface NavLink {
  label: string
  to: string
  active?: boolean
}

interface Props {
  showNavbar?: boolean
  showFooter?: boolean
  navLinks?: NavLink[]
  showSearch?: boolean
  showAuthButtons?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showNavbar: true,
  showFooter: true,
  navLinks: () => [
    { label: 'Explore', to: '/events' },
    { label: 'Host an Event', to: '/organizer/dashboard' },
    { label: 'Help', to: '/help' },
  ],
  showSearch: false,
  showAuthButtons: true,
})
</script>

<template>
  <div class="public-page-bg relative flex min-h-screen w-full flex-col overflow-x-hidden">
    <PublicNavbar
      v-if="showNavbar"
      :nav-links="props.navLinks"
      :show-search="props.showSearch"
      :show-auth-buttons="props.showAuthButtons"
    />

    <main class="flex-1">
      <slot />
    </main>

    <PublicFooter v-if="showFooter" />

    <ToastContainer />
  </div>
</template>
