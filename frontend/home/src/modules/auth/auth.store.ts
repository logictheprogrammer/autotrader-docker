import { defineStore } from 'pinia'
import type { SubmissionContext } from 'vee-validate'
import type { ILogin, IRegister } from './auth.interface'
import Cookies from 'js-cookie'

export const useAuthStore = defineStore('auth', () => {
  const basePath = 'authentication'
  const httpStore = useHttpStore()
  const router = useRouter()
  const csrfToken = ref('')
  const CONFIG = useConfigStore()
  const userPath = CONFIG.onProduction ? '/' : 'http://localhost:5174/'

  function setAuth() {
    const isAuth = readUserDataFromLocalStorage()
    if (isAuth) Cookies.set('request_code', '100', { expires: 365 })
    else getToken()
  }

  function writeUserDataToLocalStorage(accessToken: string, expiresIn: number) {
    const userData = JSON.stringify({
      accessToken,
      expiresIn,
    })
    if (CONFIG.onProduction) localStorage.setItem('userData', userData)
    else Cookies.set('userData', userData, { expires: 365 })
  }

  function readUserDataFromLocalStorage(): boolean {
    httpStore.setGet(true)
    const userDataString = CONFIG.onProduction
      ? localStorage.getItem('userData')
      : Cookies.get('userData')
    if (userDataString) {
      window.location.href = userPath
      return true
    } else {
      return false
    }
  }

  async function login(form: ILogin, contex: SubmissionContext) {
    try {
      console.log('hi')
      httpStore.setPost(true)
      const result = await axios.post(`${basePath}/login`, form)
      contex.resetForm()
      console.log(result.data.status)
      if (result.data.status !== ResponseStatus.SUCCESS)
        return httpStore.handlePost(result)
      httpStore.setGet(true)
      const data = result.data.data
      writeUserDataToLocalStorage(data.accessToken, data.expiresIn)
      Cookies.set('request_code', '100')
      console.log('hello')
      window.location.href = userPath
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
    verifyEmail,
    forgetPassword,
    resetPassword,
    setAuth,
  }
})
