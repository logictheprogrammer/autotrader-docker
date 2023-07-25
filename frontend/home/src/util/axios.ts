import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:3000/api/'
axios.defaults.withCredentials = true

axios.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (config.method !== 'get') {
    config.headers['x-csrf-token'] = authStore.csrfToken
  }
  return config
})
