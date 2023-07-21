import { defineStore } from 'pinia'
import type { SubmissionContext } from 'vee-validate'

export const useAuthStore = defineStore('auth', () => {
  const basePath = 'authentication'
  const httpStore = useHttpStore()
  const router = useRouter()
  const csrfToken = ref('')

  async function getToken() {
    try {
      httpStore.setGet(true)
      const result = await axios.get('token')
      csrfToken.value = result.data.token
      httpStore.setGet(false)
    } catch (error: any) {
      console.error(error)
      httpStore.handleGet(error.response)
    }
  }

  return {
    csrfToken,
    getToken,
  }
})
