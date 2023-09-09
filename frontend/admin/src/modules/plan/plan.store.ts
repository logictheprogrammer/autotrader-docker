import { defineStore } from 'pinia'
import type {
  ICreatePlan,
  IPlan,
  IEditPlan,
  IUpdatePlanStatus,
} from './plan.interface'

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

  function updateById(planId: string, data: IPlan) {
    const updatePlans = plans.value
    if (!updatePlans) return
    const PlanIndex = updatePlans.findIndex((plan) => plan._id === planId)
    updatePlans[PlanIndex] = data

    setPlans(updatePlans)
  }

  async function updatePlanStatus(data: IUpdatePlanStatus) {
    try {
      httpStore.setPost(true)
      const result = await axios.patch(`${basePath}/update-status`, data)

      updateById(data.planId, result.data.data.plan)
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
      setPlans(result.data.data.plans)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  async function createPlan(form: ICreatePlan) {
    try {
      httpStore.setPost(true)
      const result = await axios.post(`${basePath}/create`, form)
      const { plan } = result.data.data

      setPlans([...plans.value, plan])
      httpStore.handlePost(result)
      return true
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
      return false
    }
  }

  async function updatePlan(data: IEditPlan) {
    try {
      httpStore.setPost(true)

      const result = await axios.put(`${basePath}/update`, data)
      updateById(data.planId, result.data.data.plan)
      httpStore.handlePost(result)
      return true
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
      return false
    }
  }

  async function deletePlan(planId: string) {
    try {
      httpStore.setPost(true)
      const result = await axios.delete(`${basePath}/delete/${planId}`)

      const allPlans = plans.value
      if (!allPlans) return
      const finalPlans = allPlans.filter((plan) => plan._id !== planId)

      setPlans(finalPlans)
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
    plans,
    fetchAll,
    createPlan,
    updatePlanStatus,
    deletePlan,
    updatePlan,
  }
})
