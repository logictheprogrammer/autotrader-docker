import { INotificationObject } from '../notification.interface'
import NotificationService from '../notification.service'
import {
  notificationA,
  notificationA_id,
  notificationInstance,
} from './notification.payload'

// @ts-ignore
const notificationObj: INotificationObject = {
  ...notificationA,
  // @ts-ignore
  _id: notificationA_id,
}

export const createTransactionNotificationMock = jest
  .spyOn(NotificationService.prototype, '_createTransaction')
  .mockResolvedValue({
    object: notificationObj,
    instance: notificationInstance,
  })
