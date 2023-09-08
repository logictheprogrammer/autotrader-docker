import { defineStore } from 'pinia'
import type { IWithdrawal } from './withdrawal.interface'
import type { WithdrawalStatus } from './withdrawal.enum'

export const useWithdrawalStore = defineStore('withdrawal', () => {
  const httpStore = useHttpStore()
  const basePath = 'withdrawal'
  const withdrawals = ref<IWithdrawal[]>([])
  const loaded = ref(false)

  function setWithdrawals(withdrawalsArr: IWithdrawal[]) {
    withdrawals.value = withdrawalsArr
  }

  function setLoaded(hasLoaded: boolean) {
    loaded.value = hasLoaded
  }

  function updateById(withdrawalId: string, data: IWithdrawal) {
    const updateWithdrawals = withdrawals.value
    if (!updateWithdrawals) return
    const withdrawalIndex = updateWithdrawals.findIndex(
      (withdrawal) => withdrawal._id === withdrawalId
    )
    updateWithdrawals[withdrawalIndex] = data

    setWithdrawals(updateWithdrawals)
  }

  async function fetchAll() {
    setLoaded(false)
    try {
      const result = await axios.get(`${basePath}/master`)
      setWithdrawals(result.data.data.withdrawals)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  async function updateStatus(withdrawalId: string, status: WithdrawalStatus) {
    try {
      httpStore.setPost(true)
      const result = await axios.patch(`${basePath}/update-status`, {
        status,
        withdrawalId,
      })

      updateById(withdrawalId, result.data.data.withdrawal)
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  async function deleteOne(withdrawalId: string) {
    try {
      httpStore.setPost(true)
      const result = await axios.delete(`${basePath}/delete/${withdrawalId}`)

      const allWithdrawals = withdrawals.value
      if (!allWithdrawals) return
      const finalWithdrawals = allWithdrawals.filter(
        (withdrawal) => withdrawal._id !== withdrawalId
      )

      setWithdrawals(finalWithdrawals)
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  return {
    loaded,
    withdrawals,
    fetchAll,
    updateStatus,
    deleteOne,
  }
})
