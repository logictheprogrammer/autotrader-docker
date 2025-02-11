import { defineStore } from 'pinia'
import type { IDeposit } from './deposit.interface'
import type { DepositStatus } from './deposit.enum'

export const useDepositStore = defineStore('deposit', () => {
  const httpStore = useHttpStore()
  const userStore = useUserStore()
  const basePath = '/deposit'
  const deposits = ref<IDeposit[]>([])
  const loaded = ref(false)

  function setDeposits(depositsArr: IDeposit[]) {
    deposits.value = depositsArr
  }

  function setLoaded(hasLoaded: boolean) {
    loaded.value = hasLoaded
  }

  function updateById(depositId: string, data: IDeposit) {
    const updateDeposits = deposits.value
    if (!updateDeposits) return
    const depositIndex = updateDeposits.findIndex(
      (deposit) => deposit._id === depositId
    )
    updateDeposits[depositIndex] = data

    setDeposits(updateDeposits)
  }

  async function fetchAll() {
    setLoaded(false)
    try {
      const result = await axios.get(`/master${basePath}`)
      setDeposits(result.data.data.deposits)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  async function updateStatus(depositId: string, status: DepositStatus) {
    try {
      httpStore.setPost(true)
      const result = await axios.patch(
        `/master${basePath}/update-status/${depositId}`,
        {
          status,
        }
      )

      updateById(depositId, result.data.data.deposit)
      userStore.fetchAll()
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  async function deleteOne(depositId: string) {
    try {
      httpStore.setPost(true)
      const result = await axios.delete(
        `/master${basePath}/delete/${depositId}`
      )

      const allDeposits = deposits.value
      if (!allDeposits) return
      const finalDeposits = allDeposits.filter(
        (deposit) => deposit._id !== depositId
      )

      setDeposits(finalDeposits)
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  return {
    loaded,
    deposits,
    fetchAll,
    updateStatus,
    deleteOne,
  }
})
