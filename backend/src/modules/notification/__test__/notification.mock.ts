import { INotificationObject } from '../notification.interface'
import NotificationService from '../notification.service'
import { notificationA, notificationA_id } from './notification.payload'

// @ts-ignore
const notificationObj: INotificationObject = {
  ...notificationA,
  // @ts-ignore
  _id: notificationA_id,
}

export const createNotificationMock = jest
  .spyOn(NotificationService.prototype, 'create')
  .mockResolvedValue(notificationObj)
