import { defineStore } from 'pinia'
import type { ICurrency } from './currency.interface'

export const useCurrencyStore = defineStore('currency', () => {
  const httpStore = useHttpStore()
  const basePath = 'currency'
  const currencies = ref<ICurrency[]>([])
  const loaded = ref(false)

  function setCurrencies(currenciesArr: ICurrency[]) {
    currencies.value = currenciesArr
  }

  function setLoaded(hasLoaded: boolean) {
    loaded.value = hasLoaded
  }

  async function fetchAll() {
    setLoaded(false)
    try {
      const result = await axios.get(`${basePath}`)
      setCurrencies(result.data.data.currencies)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  return {
    loaded,
    currencies,
    fetchAll,
  }
})
