import {
  NotificationCategory,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { IAppObject } from '@/modules/app/app.interface'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { UserEnvironment } from '@/modules/user/user.enum'
import { NotificationStatus } from './notification.type'
import { Document, ObjectId } from 'mongoose'

export interface INotificationObject extends IAppObject {
  user?: IUser['_id']
  userObject: IUserObject
  message: string
  read: boolean
  categoryName: NotificationCategory
  category: IAppObject['_id']
  categoryObject: IAppObject
  forWho: NotificationForWho
  status: NotificationStatus
  environment: UserEnvironment
}

export interface INotification extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  user?: IUser['_id']
  userObject: IUserObject
  message: string
  read: boolean
  categoryName: NotificationCategory
  category: IAppObject['_id']
  categoryObject: IAppObject
  forWho: NotificationForWho
  status: NotificationStatus
  environment: UserEnvironment
}

export interface INotificationService {
  _createTransaction(
    message: string,
    categoryName: NotificationCategory,
    categoryObject: IAppObject,
    forWho: NotificationForWho,
    status: NotificationStatus,
    environment: UserEnvironment,
    user?: IUserObject
  ): TTransaction<INotificationObject, INotification>

  create(
    message: string,
    categoryName: NotificationCategory,
    categoryObject: IAppObject,
    forWho: NotificationForWho,
    status: NotificationStatus,
    environment: UserEnvironment,
    user?: IUserObject
  ): Promise<ITransactionInstance<INotification>>

  delete(
    fromAllAccounts: boolean,
    notificationId: ObjectId,
    userId?: ObjectId
  ): THttpResponse<{ notification: INotification }>

  read(
    notificationId: ObjectId,
    userId: ObjectId
  ): THttpResponse<{ notification: INotification }>

  fetch(
    fromAllAccounts: boolean,
    notificationId: ObjectId,
    userId: ObjectId
  ): THttpResponse<{ notification: INotification }>

  fetchAll(
    fromAllAccounts: boolean,
    environment: UserEnvironment,
    forWho: NotificationForWho,
    userId?: ObjectId
  ): THttpResponse<{ notifications: INotification[] }>
}
