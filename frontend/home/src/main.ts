import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './util/axios'
import App from './views/App.vue'
import router from './router'

axios.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (config.method !== 'get') {
    config.headers['x-csrf-token'] = authStore.csrfToken
  }
  return config
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
