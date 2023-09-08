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
      const result = await axios.get(`${basePath}/admin`)
      setNotifications(result.data.data.notifications)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
    setLoaded(true)
  }

  async function deleteOne(notificationId: string) {
    try {
      httpStore.setPost(true)
      const result = await axios.delete(
        `${basePath}/admin/delete/${notificationId}`
      )

      const allNotifications = notifications.value
      if (!allNotifications) return
      const finalNotifications = allNotifications.filter(
        (notification) => notification._id !== notificationId
      )

      setNotifications(finalNotifications)
      httpStore.handlePost(result)
    } catch (error: any) {
      console.error(error)
      httpStore.handlePost(error.response)
    }
  }

  return {
    loaded,
    notifications,
    fetchAll,
    deleteOne,
  }
})
