import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './util/axios'
import App from './views/App.vue'
import router from './router'
import VueCountdown from '@chenfengyuan/vue-countdown'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.component(VueCountdown.name!, VueCountdown)
app.mount('#app')
