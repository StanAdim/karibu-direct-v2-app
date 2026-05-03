import { config } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { registerAppIcons } from '~/utils/icons'

config.autoAddCss = false

export default defineNuxtPlugin((nuxtApp) => {
  registerAppIcons()
  nuxtApp.vueApp.component('FaIcon', FontAwesomeIcon)
})
