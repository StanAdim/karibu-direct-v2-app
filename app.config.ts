const appName = process.env.NUXT_PUBLIC_APP_NAME || 'KaribuDirect'
const appDescription = 'Enterprise Event Management Platform'

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand',
      secondary: 'slate',
      success: 'emerald',
      info: 'sky',
      warning: 'amber',
      error: 'rose',
      neutral: 'slate'
    },
    button: {
      defaultVariants: {
        color: 'primary'
      }
    },
    card: {
      slots: {
        root: 'bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800'
      }
    },
    input: {
      defaultVariants: {
        size: 'md'
      }
    },
    modal: {
      slots: {
        overlay: 'bg-gray-950/50 dark:bg-gray-950/75'
      }
    }
  },
  app: {
    name: appName,
    description: appDescription
  },
  theme: {
    brand: {
      50: '#e8f1fe',
      100: '#d4e4fd',
      200: '#a8c9fb',
      300: '#7daef9',
      400: '#5193f7',
      500: '#4285F4',
      600: '#1a6cf2',
      700: '#0d5ad9',
      800: '#0b4aaf',
      900: '#093a8a',
      950: '#062556'
    }
  }
})
