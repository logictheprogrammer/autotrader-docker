import { defineStore } from 'pinia'
import type {
  IAddNewWithdrawalMethod,
  IWithdrawalMethod,
  IEditWithdrawalMethod,
  IUpdateWithdrawalMethodStatus,
} from './withdrawalMethod.interface'

export const useWithdrawalMethodStore = defineStore('withdrawalMethod', () => {
  const httpStore = useHttpStore()
  const basePath = 'withdrawal-method'
  const withdrawalMethods = ref<IWithdrawalMethod[]>([])
  const loaded = ref(false)

  function setWithdrawalMethods(withdrawalMethodsArr: IWithdrawalMethod[]) {
    withdrawalMethods.value = withdrawalMethodsArr
  }

  function setLoaded(hasLoaded: boolean) {
    loaded.value = hasLoaded
  }

  function updateById(withdrawalMethodId: string, data: IWithdrawalMethod) {
    const updateWithdrawalMethods = withdrawalMethods.value
    if (!updateWithdrawalMethods) return
    const WithdrawalMethodIndex = updateWithdrawalMethods.findIndex(
      (withdrawalMethod) => withdrawalMethod._id === withdrawalMethodId
    )
    updateWithdrawalMethods[WithdrawalMethodIndex] = data

    setWithdrawalMethods(updateWithdrawalMethods)
  }

  async function updateWithdrawalMethodStatus(
    data: IUpdateWithdrawalMethodStatus
  ) {
    try {
      httpStore.setPost(true)
      const result = await axios.patch(`${basePath}/update-status`, data)

      updateById(data.withdrawalMethodId, result.data.data.withdrawalMethod)
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  async function fetchAll() {
    setLoaded(false)
    try {
      const result = await axios.get(`${basePath}`)
      setWithdrawalMethods(result.data.data.withdrawalMethods)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  async function addNewWithdrawalMethod(form: IAddNewWithdrawalMethod) {
    try {
      httpStore.setPost(true)
      const result = await axios.post(`${basePath}/create`, form)
      const { withdrawalMethod } = result.data.data

      setWithdrawalMethods([...withdrawalMethods.value, withdrawalMethod])
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  async function updateWithdrawalMethod(data: IEditWithdrawalMethod) {
    try {
      httpStore.setPost(true)

      const result = await axios.put(`${basePath}/update`, data)
      updateById(data.withdrawalMethodId, result.data.data.withdrawalMethod)
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  async function deleteWithdrawalMethod(withdrawalMethodId: string) {
    try {
      httpStore.setPost(true)
      const result = await axios.delete(
        `${basePath}/delete/${withdrawalMethodId}`
      )

      const allWithdrawalMethods = withdrawalMethods.value
      if (!allWithdrawalMethods) return
      const finalWithdrawalMethods = allWithdrawalMethods.filter(
        (withdrawalMethod) => withdrawalMethod._id !== withdrawalMethodId
      )

      setWithdrawalMethods(finalWithdrawalMethods)
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  return {
    loaded,
    withdrawalMethods,
    fetchAll,
    addNewWithdrawalMethod,
    updateWithdrawalMethodStatus,
    deleteWithdrawalMethod,
    updateWithdrawalMethod,
  }
})
