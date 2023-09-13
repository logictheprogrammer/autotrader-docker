import { defineStore } from 'pinia'
import type { IAsset } from './asset.interface'

export const useAssetStore = defineStore('asset', () => {
  const httpStore = useHttpStore()
  const basePath = 'asset'
  const assets = ref<IAsset[]>([])
  const loaded = ref(false)

  function setAssets(assetsArr: IAsset[]) {
    assets.value = assetsArr
  }

  function setLoaded(hasLoaded: boolean) {
    loaded.value = hasLoaded
  }

  async function fetchAll() {
    setLoaded(false)
    try {
      const result = await axios.get(`${basePath}`)
      setAssets(result.data.data.assets)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  return {
    loaded,
    assets,
    fetchAll,
  }
})
