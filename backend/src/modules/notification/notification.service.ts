import { Service } from 'typedi'
import {
  INotification,
  INotificationObject,
  INotificationService,
} from '@/modules/notification/notification.interface'
import notificationModel from '@/modules/notification/notification.model'
import {
  NotificationForWho,
  NotificationCategory,
} from '@/modules/notification/notification.enum'
import { Types } from 'mongoose'
import { IUserObject } from '@/modules/user/user.interface'
import ServiceQuery from '@/modules/service/service.query'
import { THttpResponse } from '@/modules/http/http.type'
import ServiceException from '@/modules/service/service.exception'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import HttpException from '@/modules/http/http.exception'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import { IServiceObject } from '@/modules/service/service.interface'
import { UserEnvironment, UserRole } from '@/modules/user/user.enum'
import { NotificationStatus } from './notification.type'

@Service()
class NotificationService implements INotificationService {
  private notificationModel = new ServiceQuery<INotification>(notificationModel)

  private find = async (
    notificationId: string | Types.ObjectId,
    fromAllAccounts: boolean = true,
    userId?: Types.ObjectId
  ): Promise<INotification> => {
    const notification = await this.notificationModel.findById(
      notificationId,
      fromAllAccounts,
      userId
    )

    if (!notification) throw new HttpException(404, 'Notification not found')

    return notification
  }

  public async _createTransaction(
    message: string,
    categoryName: NotificationCategory,
    categoryObject: IServiceObject,
    forWho: NotificationForWho,
    status: NotificationStatus,
    environment: UserEnvironment,
    user?: IUserObject
  ): TTransaction<INotificationObject, INotification> {
    try {
      const notification = new this.notificationModel.self({
        user: user ? user._id : undefined,
        userObject: user,
        message,
        categoryName,
        category: categoryObject._id,
        categoryObject,
        forWho,
        status,
        environment,
      })

      return {
        object: notification.toObject(),
        instance: {
          model: notification,
          onFailed: `Delete the notification with an id of (${notification._id})`,
          async callback() {
            await notification.deleteOne()
          },
        },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to send notification, please try again'
      )
    }
  }

  public async create(
    message: string,
    categoryName: NotificationCategory,
    categoryObject: IServiceObject,
    forWho: NotificationForWho,
    status: NotificationStatus,
    environment: UserEnvironment,
    user?: IUserObject | undefined
  ): Promise<ITransactionInstance<INotification>> {
    try {
      if (forWho === NotificationForWho.USER && !user)
        throw new Error(
          'User object must be provided when forWho is equal to user'
        )

      const { instance } = await this._createTransaction(
        message,
        categoryName,
        categoryObject,
        forWho,
        status,
        environment,
        user
      )

      return instance
    } catch (err) {
      throw new ServiceException(
        err,
        'Failed to send notification, please try again'
      )
    }
  }

  public delete = async (
    fromAllAccounts: boolean,
    notificationId: Types.ObjectId,
    userId?: Types.ObjectId
  ): THttpResponse<{ notification: INotification }> => {
    try {
      const notification = await this.find(
        notificationId,
        fromAllAccounts,
        userId
      )

      await notification.deleteOne()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Notification deleted successfully',
        data: { notification },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to delete notification, please try again'
      )
    }
  }

  public read = async (
    notificationId: Types.ObjectId,
    userId: Types.ObjectId
  ): THttpResponse<{ notification: INotification }> => {
    try {
      const notification = await this.find(notificationId, false, userId)

      notification.read = true

      await notification.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Notification has been read successfully',
        data: { notification },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to read notification, please try again'
      )
    }
  }

  public fetch = async (
    fromAllAccounts: boolean,
    notificationId: Types.ObjectId,
    userId: Types.ObjectId
  ): THttpResponse<{ notification: INotification }> => {
    try {
      const notification = await this.find(
        notificationId,
        fromAllAccounts,
        userId
      )

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Notification fetched successfully',
        data: { notification },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to fetch notification, please try again'
      )
    }
  }

  public fetchAll = async (
    fromAllAccounts: boolean,
    environment: UserEnvironment,
    userId?: Types.ObjectId
  ): THttpResponse<{ notifications: INotification[] }> => {
    try {
      const notifications = await this.notificationModel
        .find({ environment }, fromAllAccounts, {
          user: userId,
        })
        .select('-userObject')

      await this.notificationModel.populate(
        notifications,
        'user',
        'userObject',
        'username isDeleted'
      )

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Notifications fetched successfully',
        data: { notifications },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to fetch notifications, please try again'
      )
    }
  }
}

export default NotificationService
