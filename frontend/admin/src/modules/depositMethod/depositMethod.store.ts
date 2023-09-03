import { defineStore } from 'pinia'
import type {
  IAddNewDepositMethod,
  IDepositMethod,
  IEditDepositMethod,
  IUpdateDepositMethodStatus,
} from './depositMethod.interface'

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

  function updateById(depositMethodId: string, data: IDepositMethod) {
    const updateDepositMethods = depositMethods.value
    if (!updateDepositMethods) return
    const DepositMethodIndex = updateDepositMethods.findIndex(
      (depositMethod) => depositMethod._id === depositMethodId
    )
    updateDepositMethods[DepositMethodIndex] = data

    setDepositMethods(updateDepositMethods)
  }

  async function updateDepositMethodStatus(data: IUpdateDepositMethodStatus) {
    try {
      httpStore.setPost(true)
      const result = await axios.patch(`${basePath}/update-status`, data)

      updateById(data.depositMethodId, result.data.data.depositMethod)
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  async function fetchAll() {
    setLoaded(false)
    try {
      const result = await axios.get(`${basePath}/master`)
      setDepositMethods(result.data.data.depositMethods)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  async function addNewDepositMethod(form: IAddNewDepositMethod) {
    try {
      httpStore.setPost(true)
      const result = await axios.post(`${basePath}/create`, form)
      const { depositMethod } = result.data.data

      setDepositMethods([...depositMethods.value, depositMethod])
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  async function updateDepositMethod(data: IEditDepositMethod) {
    try {
      httpStore.setPost(true)

      const result = await axios.put(`${basePath}/update`, data)
      updateById(data.depositMethodId, result.data.data.depositMethod)
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  async function deleteDepositMethod(depositMethodId: string) {
    try {
      httpStore.setPost(true)
      const result = await axios.delete(`${basePath}/delete/${depositMethodId}`)

      const allDepositMethods = depositMethods.value
      if (!allDepositMethods) return
      const finalDepositMethods = allDepositMethods.filter(
        (depositMethod) => depositMethod._id !== depositMethodId
      )

      setDepositMethods(finalDepositMethods)
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  return {
    loaded,
    depositMethods,
    fetchAll,
    addNewDepositMethod,
    updateDepositMethodStatus,
    deleteDepositMethod,
    updateDepositMethod,
  }
})
