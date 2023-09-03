import { defineStore } from 'pinia'
import type { ICreateTransfer, ITransfer } from './transfer.interface'

export const useTransferStore = defineStore('transfer', () => {
  const httpStore = useHttpStore()
  const authStore = useAuthStore()
  const basePath = 'transfer'
  const transfers = ref<ITransfer[]>([])
  const loaded = ref(false)

  function setTransfers(transfersArr: ITransfer[]) {
    transfers.value = transfersArr
  }

  function setLoaded(hasLoaded: boolean) {
    loaded.value = hasLoaded
  }

  async function fetchAll() {
    setLoaded(false)
    try {
      const result = await axios.get(`${basePath}`)
      setTransfers(result.data.data.transfers)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  async function createTransfer(form: ICreateTransfer): Promise<boolean> {
    try {
      httpStore.setPost(true)
      const result = await axios.post(`${basePath}/create`, form)
      const { transfer } = result.data.data

      setTransfers([transfer, ...transfers.value])
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
    transfers,
    fetchAll,
    createTransfer,
  }
})
