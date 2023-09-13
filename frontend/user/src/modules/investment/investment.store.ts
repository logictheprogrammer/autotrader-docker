import { defineStore } from 'pinia'
import type { ICreateInvestment, IInvestment } from './investment.interface'

export const useInvestmentStore = defineStore('investment', () => {
  const httpStore = useHttpStore()
  const authStore = useAuthStore()
  const basePath = 'investment'
  const investments = ref<IInvestment[]>([])
  const loaded = ref(false)

  function setInvestments(investmentsArr: IInvestment[]) {
    investments.value = investmentsArr
  }

  function setLoaded(hasLoaded: boolean) {
    loaded.value = hasLoaded
  }

  async function fetchAll() {
    setLoaded(false)
    try {
      const result = await axios.get(`${basePath}`)
      setInvestments(result.data.data.investments)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  async function createInvestment(form: ICreateInvestment): Promise<boolean> {
    try {
      httpStore.setPost(true)
      const result = await axios.post(`${basePath}/create`, form)
      const { investment } = result.data.data

      setInvestments([investment, ...investments.value])
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
    investments,
    fetchAll,
    createInvestment,
  }
})
