import { INotificationService } from '@/modules/notification/notification.interface'
import { Inject, Service } from 'typedi'
import { Router, Response } from 'express'
import { UserEnvironment, UserRole } from '@/modules/user/user.enum'
import { NotificationForWho } from './notification.enum'
import { ObjectId } from 'mongoose'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'
import { IController } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import routePermission from '@/helpers/routePermission'

@Service()
class NotificationController implements IController {
  public path = '/notification'
  public router = Router()

  constructor(
    @Inject(ServiceToken.NOTIFICATION_SERVICE)
    private notificationService: INotificationService
  ) {
    this.intialiseRoutes()
  }

  private intialiseRoutes(): void {
    this.router.get(
      `/demo${this.path}/users`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.DEMO, NotificationForWho.USER)
    )

    this.router.get(
      `/demo${this.path}/user/:userId`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.DEMO, NotificationForWho.USER)
    )

    this.router.get(
      `/demo${this.path}`,
      routePermission(UserRole.USER),
      this.fetchAll(false, UserEnvironment.DEMO, NotificationForWho.USER)
    )

    this.router.delete(
      `${this.path}/admin/delete/:notificationId`,
      routePermission(UserRole.ADMIN),
      this.delete(true)
    )

    this.router.delete(
      `${this.path}/delete/:notificationId`,
      routePermission(UserRole.USER),
      this.delete(false)
    )

    this.router.get(
      `${this.path}/users`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.LIVE, NotificationForWho.USER)
    )

    this.router.get(
      `${this.path}/user/:userId`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.LIVE, NotificationForWho.USER)
    )

    this.router.get(
      `${this.path}/master`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.LIVE, NotificationForWho.ADMIN)
    )

    this.router.get(
      `${this.path}`,
      routePermission(UserRole.USER),
      this.fetchAll(false, UserEnvironment.LIVE, NotificationForWho.USER)
    )
  }

  private fetchAll = (
    byAdmin: boolean,
    environment: UserEnvironment,
    forWho: NotificationForWho
  ) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      let notifications
      if (byAdmin && req.params.userId) {
        notifications = await this.notificationService.fetchAll({
          environment,
          forWho,
          user: req.params.userId,
        })
      } else if (byAdmin) {
        notifications = await this.notificationService.fetchAll({
          environment,
          forWho,
        })
      } else {
        const userId = req.user._id
        notifications = await this.notificationService.fetchAll({
          environment,
          forWho,
          user: userId,
        })
      }
      return new SuccessResponse('Notifications fetched successfully', {
        notifications,
      }).send(res)
    })

  private delete = (byAdmin: boolean) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      const notificationId = req.params.notificationId as unknown as ObjectId
      let notification
      if (byAdmin) {
        notification = await this.notificationService.delete({
          _id: notificationId,
        })
      } else {
        notification = await this.notificationService.delete({
          _id: notificationId,
          user: req.user._id,
        })
      }

      return new SuccessResponse('Notifications deleted successfully', {
        notification,
      }).send(res)
    })
}

export default NotificationController
