import { notificationService } from '../../../setup'
import { INotificationObject } from '../notification.interface'
import { notificationA, notificationA_id } from './notification.payload'

// @ts-ignore
const notificationObj: INotificationObject = {
  ...notificationA,
  // @ts-ignore
  _id: notificationA_id,
}

export const createNotificationMock = jest
  .spyOn(notificationService, 'create')
  .mockResolvedValue(notificationObj)
