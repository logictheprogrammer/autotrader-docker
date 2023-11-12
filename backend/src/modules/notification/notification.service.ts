import { Service } from 'typedi'
import {
  INotification,
  INotificationObject,
  INotificationService,
} from '@/modules/notification/notification.interface'
import {
  NotificationForWho,
  NotificationTitle,
} from '@/modules/notification/notification.enum'
import { IUserObject } from '@/modules/user/user.interface'
import { UserEnvironment } from '@/modules/user/user.enum'
import { FilterQuery } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import { InternalError, NotFoundError } from '@/core/apiError'
import NotificationModel from '@/modules/notification/notification.model'

@Service()
class NotificationService implements INotificationService {
  private notificationModel = NotificationModel

  public async create(
    message: string,
    title: NotificationTitle,
    object: baseObjectInterface,
    forWho: NotificationForWho,
    environment: UserEnvironment,
    user?: IUserObject
  ): Promise<INotificationObject> {
    if (forWho === NotificationForWho.USER && !user)
      throw new InternalError(
        'User object must be provided when forWho is equal to user'
      )

    const notification = await this.notificationModel.create({
      user,
      message,
      title,
      object,
      forWho,
      environment,
    })

    return notification
  }

  public async delete(
    filter: FilterQuery<INotification>
  ): Promise<INotificationObject> {
    const notification = await this.notificationModel.findOne(filter)

    if (!notification) throw new NotFoundError('Notification not found')

    await notification.deleteOne()

    return notification
  }

  public async read(
    filter: FilterQuery<INotification>
  ): Promise<INotificationObject> {
    const notification = await this.notificationModel
      .findOne(filter)
      .populate('user')

    if (!notification) throw new NotFoundError('Notification not found')

    notification.read = true

    await notification.save()

    return notification
  }

  public async fetchAll(
    filter: FilterQuery<INotification>
  ): Promise<INotificationObject[]> {
    const notifications = await this.notificationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('user')

    return notifications
  }

  public async count(filter: FilterQuery<INotification>): Promise<number> {
    return await this.notificationModel.count(filter)
  }
}

export default NotificationService
