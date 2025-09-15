import './assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { inject } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import {
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faHeart,
  faIceCream,
  faFaceGrinHearts,
  faSackDollar,
  faChevronUp,
  faShoppingCart,
  faUser,
  faCreditCard,
  faReceipt,
  faClock,
} from '@fortawesome/free-solid-svg-icons'

import {
  faWhatsapp,
  faFacebookF,
  faInstagram,
  faTwitter,
  faLinkedinIn,
} from '@fortawesome/free-brands-svg-icons'

library.add(
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faHeart,
  faIceCream,
  faFaceGrinHearts,
  faSackDollar,
  faWhatsapp,
  faFacebookF,
  faInstagram,
  faTwitter,
  faLinkedinIn,
  faChevronUp,
  faShoppingCart,
  faUser,
  faCreditCard,
  faReceipt,
  faClock,
)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')

inject()
injectSpeedInsights()
