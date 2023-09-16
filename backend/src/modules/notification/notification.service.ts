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
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { THttpResponse } from '@/modules/http/http.type'
import AppException from '@/modules/app/app.exception'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import HttpException from '@/modules/http/http.exception'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import { IAppObject } from '@/modules/app/app.interface'
import { UserEnvironment } from '@/modules/user/user.enum'
import { NotificationStatus } from './notification.type'
import userModel from '../user/user.model'
import { ObjectId } from 'mongoose'

@Service()
class NotificationService implements INotificationService {
  private notificationModel = notificationModel
  private userModel = userModel

  private find = async (
    notificationId: ObjectId,
    fromAllAccounts: boolean = true,
    userId?: ObjectId
  ): Promise<INotification> => {
    let notification

    if (fromAllAccounts) {
      notification = await this.notificationModel.findById(notificationId)
    } else {
      notification = await this.notificationModel.findOne({
        _id: notificationId,
        user: userId,
      })
    }

    if (!notification) throw new HttpException(404, 'Notification not found')

    return notification
  }

  public async _createTransaction(
    message: string,
    categoryName: NotificationCategory,
    categoryObject: IAppObject,
    forWho: NotificationForWho,
    status: NotificationStatus,
    environment: UserEnvironment,
    user?: IUserObject
  ): TTransaction<INotificationObject, INotification> {
    try {
      const notification = new this.notificationModel({
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
        object: notification.toObject({ getters: true }),
        instance: {
          model: notification,
          onFailed: `Delete the notification with an id of (${notification._id})`,
          async callback() {
            await notification.deleteOne()
          },
        },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Unable to send notification, please try again'
      )
    }
  }

  public async create(
    message: string,
    categoryName: NotificationCategory,
    categoryObject: IAppObject,
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
      throw new AppException(
        err,
        'Failed to send notification, please try again'
      )
    }
  }

  public delete = async (
    fromAllAccounts: boolean,
    notificationId: ObjectId,
    userId?: ObjectId
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
      throw new AppException(
        err,
        'Failed to delete notification, please try again'
      )
    }
  }

  public read = async (
    notificationId: ObjectId,
    userId: ObjectId
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
      throw new AppException(
        err,
        'Failed to read notification, please try again'
      )
    }
  }

  public fetch = async (
    fromAllAccounts: boolean,
    notificationId: ObjectId,
    userId: ObjectId
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
      throw new AppException(
        err,
        'Failed to fetch notification, please try again'
      )
    }
  }

  public fetchAll = async (
    fromAllAccounts: boolean,
    environment: UserEnvironment,
    forWho: NotificationForWho,
    userId?: ObjectId
  ): THttpResponse<{ notifications: INotification[] }> => {
    try {
      let notifications

      if (fromAllAccounts && forWho === NotificationForWho.USER) {
        notifications = await this.notificationModel
          .find({ environment, forWho })
          .sort({ createdAt: -1 })
          .select('-userObject -categoryObject')
          .populate('user', 'username isDeleted')
      } else if (fromAllAccounts) {
        notifications = await this.notificationModel
          .find({ environment, forWho })
          .sort({ createdAt: -1 })
          .select('-userObject -categoryObject')
      } else {
        notifications = await this.notificationModel
          .find({ environment, forWho, user: userId })
          .sort({ createdAt: -1 })
          .select('-userObject -categoryObject')
      }

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Notifications fetched successfully',
        data: { notifications },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to fetch notifications, please try again'
      )
    }
  }
}

export default NotificationService
