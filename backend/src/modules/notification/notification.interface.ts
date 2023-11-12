import {
  NotificationTitle,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import { IUser, IUserObject } from '@/modules/user/user.interface'

import { UserEnvironment } from '@/modules/user/user.enum'
import { FilterQuery } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'

export interface INotificationObject extends baseObjectInterface {
  user?: IUser['_id']
  message: string
  read: boolean
  title: NotificationTitle
  object: baseModelInterface
  forWho: NotificationForWho
  environment: UserEnvironment
}

// @ts-ignore
export interface INotification
  extends baseModelInterface,
    INotificationObject {}

export interface INotificationService {
  create(
    message: string,
    title: NotificationTitle,
    object: baseObjectInterface,
    forWho: NotificationForWho,
    environment: UserEnvironment,
    user?: IUserObject
  ): Promise<INotificationObject>

  delete(filter: FilterQuery<INotification>): Promise<INotificationObject>

  read(filter: FilterQuery<INotification>): Promise<INotificationObject>

  fetchAll(filter: FilterQuery<INotification>): Promise<INotificationObject[]>

  count(filter: FilterQuery<INotification>): Promise<number>
}
