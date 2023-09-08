import type {
  NotificationCategory,
  NotificationStatus,
} from './notification.enum'

export interface INotification {
  __v: number
  _id: string
  updatedAt: string
  createdAt: string
  user: string
  message: string
  read: boolean
  categoryName: NotificationCategory
  category: string
  status: NotificationStatus
}
