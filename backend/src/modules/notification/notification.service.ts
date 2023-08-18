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
import AppRepository from '../app/app.repository'
import AppObjectId from '../app/app.objectId'
import userModel from '../user/user.model'

@Service()
class NotificationService implements INotificationService {
  private notificationRepository = new AppRepository<INotification>(
    notificationModel
  )
  private userRepository = new AppRepository<IUser>(userModel)

  private find = async (
    notificationId: string | AppObjectId,
    fromAllAccounts: boolean = true,
    userId?: AppObjectId
  ): Promise<INotification> => {
    const notification = await this.notificationRepository
      .findById(notificationId, fromAllAccounts, userId)
      .collect()

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
      const notification = this.notificationRepository.create({
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

      const unsavedNotification = notification.collectUnsaved()

      return {
        object: unsavedNotification,
        instance: {
          model: notification,
          onFailed: `Delete the notification with an id of (${unsavedNotification._id})`,
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
    notificationId: AppObjectId,
    userId?: AppObjectId
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
    notificationId: AppObjectId,
    userId: AppObjectId
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
    notificationId: AppObjectId,
    userId: AppObjectId
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
    userId?: AppObjectId
  ): THttpResponse<{ notifications: INotification[] }> => {
    try {
      const notifications = await this.notificationRepository
        .find({ environment }, fromAllAccounts, {
          user: userId,
        })
        .select('-userObject')
        .collectAll()

      await this.notificationRepository.populateAll(
        notifications,
        'user',
        'userObject',
        'username isDeleted',
        this.userRepository
      )

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
