import { defineStore } from 'pinia'
import type { ITransaction } from './transaction.interface'

export const useTransactionStore = defineStore('transaction', () => {
  const httpStore = useHttpStore()
  const basePath = 'transaction'
  const transactions = ref<ITransaction[]>([])
  const loaded = ref(false)

  function setTransactions(transactionsArr: ITransaction[]) {
    transactions.value = transactionsArr
  }

  function setLoaded(hasLoaded: boolean) {
    loaded.value = hasLoaded
  }

  async function fetchAll() {
    setLoaded(false)
    try {
      const result = await axios.get(`${basePath}`)
      setTransactions(result.data.data.transactions)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  return {
    loaded,
    transactions,
    fetchAll,
  }
})
