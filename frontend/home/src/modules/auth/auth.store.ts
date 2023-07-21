import { defineStore } from 'pinia'
import type { SubmissionContext } from 'vee-validate'
import type { ILogin, IRegister } from './auth.interface'

export const useAuthStore = defineStore('auth', () => {
  const basePath = 'authentication'
  const httpStore = useHttpStore()
  const router = useRouter()
  const csrfToken = ref('')

  function writeUserDataToLocalStorage(accessToken: string, expiresIn: number) {
    localStorage.setItem(
      'userData',
      JSON.stringify({
        accessToken,
        expiresIn,
      })
    )
  }

  function readUserDataFromLocalStorage() {
    const userDataString = localStorage.getItem('userData')
    if (userDataString) {
      const userData = JSON.parse(userDataString)
      // set cookies
      window.location.href = '/'
    }
  }

  async function login(form: ILogin, contex: SubmissionContext) {
    try {
      httpStore.setPost(true)
      const result = await axios.post(`${basePath}/login`, form)
      contex.resetForm()
      if (result.data.status !== ResponseStatus.SUCCESS)
        return httpStore.handlePost(result)
      const data = result.data.data
      writeUserDataToLocalStorage(data.accessToken, data.expiresIn)
      // set cookies
      window.location.href = '/'
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  async function register(form: IRegister, contex: SubmissionContext) {
    try {
      httpStore.setPost(true)
      const result = await axios.post(`${basePath}/register`, form)
      httpStore.handlePost(result)
      contex.resetForm()
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  async function forgetPassword(form: any, contex: SubmissionContext) {
    try {
      httpStore.setPost(true)
      const result = await axios.post(`${basePath}/forget-password`, form)
      httpStore.handlePost(result)
      contex.resetForm()
      console.log(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  async function verifyEmail(key: string, verifyToken: string) {
    httpStore.setGet(true)
    router.push({ name: 'signin' })
    try {
      const result = await axios.patch(`${basePath}/verify-email`, {
        key,
        verifyToken,
      })
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    httpStore.setGet(false)
  }

  async function resetPassword(form: any, contex: SubmissionContext) {
    try {
      httpStore.setPost(true)
      const result = await axios.patch(`${basePath}/reset-password`, form)
      httpStore.handlePost(result)
      contex.resetForm()
      router.push({ name: 'signin' })
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    httpStore.setGet(false)
  }

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
    login,
    register,
    getToken,
    verifyEmail,
    forgetPassword,
    resetPassword,
    readUserDataFromLocalStorage,
  }
})
