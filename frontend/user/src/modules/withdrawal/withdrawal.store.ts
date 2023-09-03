import { defineStore } from 'pinia'
import type { ICreateWithdrawal, IWithdrawal } from './withdrawal.interface'

export const useWithdrawalStore = defineStore('withdrawal', () => {
  const httpStore = useHttpStore()
  const authStore = useAuthStore()
  const basePath = 'withdrawal'
  const withdrawals = ref<IWithdrawal[]>([])
  const loaded = ref(false)

  function setWithdrawals(withdrawalsArr: IWithdrawal[]) {
    withdrawals.value = withdrawalsArr
  }

  function setLoaded(hasLoaded: boolean) {
    loaded.value = hasLoaded
  }

  async function fetchAll() {
    setLoaded(false)
    try {
      const result = await axios.get(`${basePath}`)
      setWithdrawals(result.data.data.withdrawals)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  async function createWithdrawal(form: ICreateWithdrawal): Promise<boolean> {
    try {
      httpStore.setPost(true)
      const result = await axios.post(`${basePath}/create`, form)
      const { withdrawal } = result.data.data

      setWithdrawals([withdrawal, ...withdrawals.value])
      httpStore.handlePost(result)
      authStore.setUser()
      return true
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)

      return false
    }
  }

  return {
    loaded,
    withdrawals,
    fetchAll,
    createWithdrawal,
  }
})
