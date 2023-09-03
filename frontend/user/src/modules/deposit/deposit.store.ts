import { defineStore } from 'pinia'
import type { ICreateDeposit, IDeposit } from './deposit.interface'

export const useDepositStore = defineStore('deposit', () => {
  const httpStore = useHttpStore()
  const basePath = 'deposit'
  const deposits = ref<IDeposit[]>([])
  const loaded = ref(false)

  function setDeposits(depositsArr: IDeposit[]) {
    deposits.value = depositsArr
  }

  function setLoaded(hasLoaded: boolean) {
    loaded.value = hasLoaded
  }

  async function fetchAll() {
    setLoaded(false)
    try {
      const result = await axios.get(`${basePath}`)
      setDeposits(result.data.data.deposits)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  async function createDeposit(form: ICreateDeposit): Promise<boolean> {
    try {
      httpStore.setPost(true)
      const result = await axios.post(`${basePath}/create`, form)
      const { deposit } = result.data.data

      setDeposits([deposit, ...deposits.value])
      httpStore.handlePost(result)

      return true
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)

      return false
    }
  }

  return {
    loaded,
    deposits,
    fetchAll,
    createDeposit,
  }
})
