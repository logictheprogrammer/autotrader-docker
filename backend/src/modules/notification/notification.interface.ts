import { Document, Types } from 'mongoose'
import {
  NotificationCategory,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { IServiceObject } from '@/modules/service/service.interface'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { UserEnvironment } from '@/modules/user/user.enum'
import { NotificationStatus } from './notification.type'

export interface INotificationObject extends IServiceObject {
  user?: IUser['_id']
  userObject: IUserObject
  message: string
  read: boolean
  categoryName: NotificationCategory
  category: IServiceObject['_id']
  categoryObject: IServiceObject
  forWho: NotificationForWho
  status: NotificationStatus
  environment: UserEnvironment
}

export interface INotification extends Document {
  user?: IUser['_id']
  userObject: IUserObject
  message: string
  read: boolean
  categoryName: NotificationCategory
  category: IServiceObject['_id']
  categoryObject: IServiceObject
  forWho: NotificationForWho
  status: NotificationStatus
  environment: UserEnvironment
}

export interface INotificationService {
  _createTransaction(
    message: string,
    categoryName: NotificationCategory,
    categoryObject: IServiceObject,
    forWho: NotificationForWho,
    status: NotificationStatus,
    environment: UserEnvironment,
    user?: IUserObject
  ): TTransaction<INotificationObject, INotification>

  create(
    message: string,
    categoryName: NotificationCategory,
    categoryObject: IServiceObject,
    forWho: NotificationForWho,
    status: NotificationStatus,
    environment: UserEnvironment,
    user?: IUserObject
  ): Promise<ITransactionInstance<INotification>>

  delete(
    fromAllAccounts: boolean,
    notificationId: Types.ObjectId,
    userId?: Types.ObjectId
  ): THttpResponse<{ notification: INotification }>

  read(
    notificationId: Types.ObjectId,
    userId: Types.ObjectId
  ): THttpResponse<{ notification: INotification }>

  fetch(
    fromAllAccounts: boolean,
    notificationId: Types.ObjectId,
    userId: Types.ObjectId
  ): THttpResponse<{ notification: INotification }>

  fetchAll(
    fromAllAccounts: boolean,
    environment: UserEnvironment,
    userId?: Types.ObjectId
  ): THttpResponse<{ notifications: INotification[] }>
}
