import { defineStore } from 'pinia'
// import type { SubmissionContext } from 'vee-validate'

export const useUserStore = defineStore('user', () => {
  const httpStore = useHttpStore()
  const authStore = useAuthStore()
  const basePath = 'users'

  async function updateProfile(form: any) {
    try {
      httpStore.setPost(true)
      const result = await axios.put(`${basePath}/update-profile`, form)
      authStore.setUser()
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  return { updateProfile }
})
