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
import { IUserObject } from '@/modules/user/user.interface'
import { UserEnvironment } from '@/modules/user/user.enum'
import { NotificationStatus } from './notification.type'
import { FilterQuery } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import { InternalError, NotFoundError, ServiceError } from '@/core/apiError'

@Service()
class NotificationService implements INotificationService {
  private notificationModel = notificationModel

  public async create(
    message: string,
    categoryName: NotificationCategory,
    categoryObject: baseObjectInterface,
    forWho: NotificationForWho,
    status: NotificationStatus,
    environment: UserEnvironment,
    user?: IUserObject
  ): Promise<INotificationObject> {
    try {
      if (forWho === NotificationForWho.USER && !user)
        throw new InternalError(
          'User object must be provided when forWho is equal to user'
        )

      const notification = await this.notificationModel.create({
        user,
        message,
        categoryName,
        category: categoryObject,
        forWho,
        status,
        environment,
      })

      return notification
    } catch (err) {
      throw new ServiceError(
        err,
        'Failed to send notification, please try again'
      )
    }
  }

  public async delete(
    filter: FilterQuery<INotification>
  ): Promise<INotificationObject> {
    try {
      const notification = await this.notificationModel.findOne(filter)

      if (!notification) throw new NotFoundError('Notification not found')

      await notification.deleteOne()

      return notification
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to delete notification, please try again'
      )
    }
  }

  public async read(
    filter: FilterQuery<INotification>
  ): Promise<INotificationObject> {
    try {
      const notification = await this.notificationModel.findOne(filter)

      if (!notification) throw new NotFoundError('Notification not found')

      notification.read = true

      await notification.save()

      return notification
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to read notification, please try again'
      )
    }
  }

  public async fetchAll(
    filter: FilterQuery<INotification>
  ): Promise<INotificationObject[]> {
    try {
      const notifications = await this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .select('-userObject -categoryObject')
        .populate('user', 'username isDeleted')

      return notifications
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to fetch notifications, please try again'
      )
    }
  }
}

export default NotificationService
