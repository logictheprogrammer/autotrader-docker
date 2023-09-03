import { defineStore } from 'pinia'
import type { ITransferSettings } from './transferSettings.interface'

export const useTransferSettingsStore = defineStore('transferSettings', () => {
  const httpStore = useHttpStore()
  const basePath = 'transfer-settings'
  const transferSettings = ref<ITransferSettings>()
  const loaded = ref(false)

  function setTransferSettings(transferSettingsArr: ITransferSettings) {
    transferSettings.value = transferSettingsArr
  }

  function setLoaded(hasLoaded: boolean) {
    loaded.value = hasLoaded
  }

  async function fetch() {
    setLoaded(false)
    try {
      const result = await axios.get(`${basePath}`)
      setTransferSettings(result.data.data.transferSettings)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  return {
    loaded,
    transferSettings,
    fetch,
  }
})
