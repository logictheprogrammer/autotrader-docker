import {
  NotificationCategory,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import { IUserObject } from '@/modules/user/user.interface'

import { UserEnvironment } from '@/modules/user/user.enum'
import { NotificationStatus } from './notification.type'
import { FilterQuery } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'

export interface INotificationObject extends baseObjectInterface {
  user?: IUserObject
  message: string
  read: boolean
  categoryName: NotificationCategory
  category: baseObjectInterface
  forWho: NotificationForWho
  status: NotificationStatus
  environment: UserEnvironment
}

// @ts-ignore
export interface INotification
  extends baseModelInterface,
    INotificationObject {}

export interface INotificationService {
  create(
    message: string,
    categoryName: NotificationCategory,
    categoryObject: baseObjectInterface,
    forWho: NotificationForWho,
    status: NotificationStatus,
    environment: UserEnvironment,
    user?: IUserObject
  ): Promise<INotificationObject>

  delete(filter: FilterQuery<INotification>): Promise<INotificationObject>

  read(filter: FilterQuery<INotification>): Promise<INotificationObject>

  fetchAll(filter: FilterQuery<INotification>): Promise<INotificationObject[]>
}
