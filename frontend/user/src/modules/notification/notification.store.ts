import { defineStore } from 'pinia'
import type { INotification } from './notification.interface'

export const useNotificationStore = defineStore('notification', () => {
  const httpStore = useHttpStore()
  const basePath = 'notification'
  const notifications = ref<INotification[]>([])
  const loaded = ref(false)

  function setNotifications(notificationsArr: INotification[]) {
    notifications.value = notificationsArr
  }

  function setLoaded(hasLoaded: boolean) {
    loaded.value = hasLoaded
  }

  async function fetchAll() {
    setLoaded(false)
    try {
      const result = await axios.get(`${basePath}`)
      setNotifications(result.data.data.notifications)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  return {
    loaded,
    notifications,
    fetchAll,
  }
})
