import { defineStore } from 'pinia'
import type { SubmissionContext } from 'vee-validate'
import Cookies from 'js-cookie'
import type { IUser } from '../user/user.interface'

export const useAuthStore = defineStore('auth', () => {
  const httpStore = useHttpStore()
  const CONFIG = useConfigStore()
  const homePath = CONFIG.onProduction ? '/' : 'http://localhost:5173/'
  const userPath = CONFIG.onProduction ? '/' : 'http://localhost:5174/'
  const basePath = 'authentication'
  const user = ref<IUser>()
  const csrfToken = ref('')
  const accessToken = ref('')
  const expiresIn = ref(0)
  const authNotice = ref(false)
  const timer = ref(0)
  const noticeTimer = ref(0)

  async function setUser() {
    try {
      const result = await axios.get(`${basePath}/user`)
      const loggedInUser: IUser = result.data.data.user
      if (loggedInUser.role < UserRole.ADMIN) return false
      else {
        user.value = loggedInUser
        return true
      }
    } catch (error: any) {
      console.error(error)
      httpStore.handleGet(error.response)
      return false
    }
  }

  function setUserData(token: string, expires: number) {
    expiresIn.value = expires
    accessToken.value = token
  }

  function setCsrfToken(token: string) {
    csrfToken.value = token
  }

  function setAuthNotice(notice: boolean) {
    authNotice.value = notice
  }

  function setTimer(time: number) {
    timer.value = time
  }

  function setNoticeTimer(time: number) {
    noticeTimer.value = time
  }

  function goUser() {
    Cookies.set('request_code', '100', { expires: 365 })
    window.location.href = userPath
  }

  async function startAuth() {
    httpStore.setGet(true)
    const isAuth = autoLogin()
    if (!isAuth) return logout()
    getToken()
    const isAdmin = await setUser()
    if (!isAdmin) return goUser()
    httpStore.setGet(false)
  }

  async function getToken() {
    try {
      const result = await axios.get('token')
      setCsrfToken(result.data.token)
    } catch (error: any) {
      console.error(error)
      httpStore.handleGet(error.response)
    }
  }

  function autoLogin(): boolean {
    const userDataString = CONFIG.onProduction
      ? localStorage.getItem('userData')
      : Cookies.get('userData')
    try {
      if (!userDataString) throw new Error('Unauthorized')
      const userData = JSON.parse(userDataString)

      setUserData(userData.accessToken, userData.expiresIn)

      const expireTime = expiresIn.value - new Date().getTime()
      if (expireTime < 30000) throw new Error('Session expired')
      setTimer(setTimeout(logout, expireTime))
      setNoticeTimer(
        setTimeout(() => {
          setAuthNotice(true)
        }, expireTime - 120000)
      )

      return true
    } catch (error) {
      return false
    }
  }

  async function updatePassword(form: any, contex: SubmissionContext) {
    try {
      httpStore.setPost(true)
      const result = await axios.patch(`${basePath}/update-password`, form)
      httpStore.handlePost(result)
      contex.resetForm()
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  function logout() {
    setAuthNotice(false)

    if (timer) clearTimeout(timer.value)
    if (noticeTimer) clearTimeout(noticeTimer.value)
    Cookies.set('request_code', '300', { expires: 365 })
    if (CONFIG.onProduction) localStorage.removeItem('userData')
    else Cookies.remove('userData')

    setTimeout(() => {
      httpStore.setGet(true)
      setUserData('', 0)
      window.location.href = homePath + 'signin'
    }, 500)
  }

  return {
    csrfToken,
    accessToken,
    authNotice,
    expiresIn,
    user,
    setUser,
    goUser,
    updatePassword,
    logout,
    startAuth,
    getToken,
    autoLogin,
  }
})
