import { defineStore } from 'pinia'
import type { ITransfer } from './transfer.interface'
import type { TransferStatus } from './transfer.enum'

export const useTransferStore = defineStore('transfer', () => {
  const httpStore = useHttpStore()
  const basePath = 'transfer'
  const transfers = ref<ITransfer[]>([])
  const loaded = ref(false)

  function setTransfers(transfersArr: ITransfer[]) {
    transfers.value = transfersArr
  }

  function setLoaded(hasLoaded: boolean) {
    loaded.value = hasLoaded
  }

  function updateById(transferId: string, data: ITransfer) {
    const updateTransfers = transfers.value
    if (!updateTransfers) return
    const transferIndex = updateTransfers.findIndex(
      (transfer) => transfer._id === transferId
    )
    updateTransfers[transferIndex] = data

    setTransfers(updateTransfers)
  }

  async function fetchAll() {
    setLoaded(false)
    try {
      const result = await axios.get(`${basePath}/master`)
      setTransfers(result.data.data.transfers)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  async function updateStatus(transferId: string, status: TransferStatus) {
    try {
      httpStore.setPost(true)
      const result = await axios.patch(`${basePath}/update-status`, {
        status,
        transferId,
      })

      updateById(transferId, result.data.data.transfer)
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  async function deleteOne(transferId: string) {
    try {
      httpStore.setPost(true)
      const result = await axios.delete(`${basePath}/delete/${transferId}`)

      const allTransfers = transfers.value
      if (!allTransfers) return
      const finalTransfers = allTransfers.filter(
        (transfer) => transfer._id !== transferId
      )

      setTransfers(finalTransfers)
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  return {
    loaded,
    transfers,
    fetchAll,
    updateStatus,
    deleteOne,
  }
})
