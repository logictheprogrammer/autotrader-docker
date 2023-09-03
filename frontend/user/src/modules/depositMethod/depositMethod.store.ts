import { defineStore } from 'pinia'
import type { IDepositMethod } from './depositMethod.interface'

export const useDepositMethodStore = defineStore('depositMethod', () => {
  const httpStore = useHttpStore()
  const basePath = 'deposit-method'
  const depositMethods = ref<IDepositMethod[]>([])
  const loaded = ref(false)

  function setDepositMethods(depositMethodsArr: IDepositMethod[]) {
    depositMethods.value = depositMethodsArr
  }

  function setLoaded(hasLoaded: boolean) {
    loaded.value = hasLoaded
  }

  async function fetchAll() {
    setLoaded(false)
    try {
      const result = await axios.get(`${basePath}`)
      setDepositMethods(result.data.data.depositMethods)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  return {
    loaded,
    depositMethods,
    fetchAll,
  }
})
