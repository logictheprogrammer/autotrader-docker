import { defineStore } from 'pinia'
// import type { SubmissionContext } from 'vee-validate'
import Cookies from 'js-cookie'
import type { IUser } from '../user/user.interface'

export const useAuthStore = defineStore('auth', () => {
  const httpStore = useHttpStore()
  const CONFIG = useConfigStore()
  const homePath = CONFIG.onProduction ? '/' : 'http://localhost:5173/'
  // const basePath = 'authentication'
  // const router = useRouter()
  const user = ref<IUser>()
  const csrfToken = ref('')
  const accessToken = ref('')
  const expiresIn = ref(0)
  const authNotice = ref(false)
  const timer = ref(0)
  const noticeTimer = ref(0)

  function setUserData(token: string, expires: number, userInfo?: IUser) {
    user.value = userInfo
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

  function startAuth() {
    const isAuth = autoLogin()
    if (isAuth) getToken()
    else logout()
  }

  async function getToken() {
    try {
      httpStore.setGet(true)
      const result = await axios.get('token')
      setCsrfToken(result.data.token)
      httpStore.setGet(false)
    } catch (error: any) {
      console.error(error)
      httpStore.handleGet(error.response)
    }
  }

  function autoLogin(): boolean {
    httpStore.setGet(true)
    const userDataString = CONFIG.onProduction
      ? localStorage.getItem('userData')
      : Cookies.get('userData')
    try {
      if (!userDataString) throw new Error('Unauthorized')
      const userData = JSON.parse(userDataString)

      setUserData(userData.accessToken, userData.expiresIn, userData.user)

      const expireTime = expiresIn.value - new Date().getTime()
      if (expireTime < 30000) throw new Error('Session expired')
      setTimer(setTimeout(logout, expireTime))
      setNoticeTimer(
        setTimeout(() => {
          setAuthNotice(true)
        }, expireTime - 120000)
      )

      console.log(userData)

      return true
    } catch (error) {
      logout()
      return false
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
    logout,
    startAuth,
    getToken,
    autoLogin,
  }
})
