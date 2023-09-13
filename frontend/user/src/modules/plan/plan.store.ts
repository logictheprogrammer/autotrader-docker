import { defineStore } from 'pinia'
import type { IPlan } from './plan.interface'

export const usePlanStore = defineStore('plan', () => {
  const httpStore = useHttpStore()
  const basePath = 'plans'
  const plans = ref<IPlan[]>([])
  const loaded = ref(false)

  function setPlans(plansArr: IPlan[]) {
    plans.value = plansArr
  }

  function setLoaded(hasLoaded: boolean) {
    loaded.value = hasLoaded
  }

  async function fetchAll() {
    setLoaded(false)
    try {
      const result = await axios.get(`${basePath}`)
      setPlans(result.data.data.plans)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  return {
    loaded,
    plans,
    fetchAll,
  }
})
