import { INotificationService } from '@/modules/notification/notification.interface'
import { Inject, Service } from 'typedi'
import { Router, Response } from 'express'
import { UserEnvironment, UserRole } from '@/modules/user/user.enum'
import { NotificationForWho } from './notification.enum'
import { ObjectId } from 'mongoose'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'
import { IController, IControllerRoute } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import routePermission from '@/helpers/routePermission'
import BaseController from '@/core/baseController'

@Service()
class NotificationController extends BaseController implements IController {
  public path = '/notification'
  public routes: IControllerRoute[] = [
    [
      'delete',
      `${this.path}/delete/:notificationId`,
      routePermission(UserRole.USER),
      (...params) => this.delete(false)(...params),
    ],
    [
      'get',
      `${this.path}`,
      routePermission(UserRole.USER),
      (...params) =>
        this.fetchAll(
          false,
          true,
          UserEnvironment.LIVE,
          NotificationForWho.USER
        )(...params),
    ],
    [
      'get',
      `/demo${this.path}`,
      routePermission(UserRole.USER),
      (...params) =>
        this.fetchAll(
          false,
          true,
          UserEnvironment.DEMO,
          NotificationForWho.USER
        )(...params),
    ],
    [
      'get',
      `/master/demo${this.path}/users`,
      routePermission(UserRole.ADMIN),
      (...params) =>
        this.fetchAll(
          true,
          true,
          UserEnvironment.DEMO,
          NotificationForWho.USER
        )(...params),
    ],
    [
      'get',
      `/master/demo${this.path}/user/:userId`,
      routePermission(UserRole.ADMIN),
      (...params) =>
        this.fetchAll(
          true,
          false,
          UserEnvironment.DEMO,
          NotificationForWho.USER
        )(...params),
    ],
    [
      'delete',
      `/master${this.path}/delete/:notificationId`,
      routePermission(UserRole.ADMIN),
      (...params) => this.delete(true)(...params),
    ],
    [
      'get',
      `/master${this.path}/users`,
      routePermission(UserRole.ADMIN),
      (...params) =>
        this.fetchAll(
          true,
          true,
          UserEnvironment.LIVE,
          NotificationForWho.USER
        )(...params),
    ],
    [
      'get',
      `/master${this.path}/user/:userId`,
      routePermission(UserRole.ADMIN),
      (...params) =>
        this.fetchAll(
          true,
          false,
          UserEnvironment.LIVE,
          NotificationForWho.USER
        )(...params),
    ],
    [
      'get',
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      (...params) =>
        this.fetchAll(
          true,
          true,
          UserEnvironment.LIVE,
          NotificationForWho.ADMIN
        )(...params),
    ],
  ]

  constructor(
    @Inject(ServiceToken.NOTIFICATION_SERVICE)
    private notificationService: INotificationService
  ) {
    super()
    this.initializeRoutes()
  }

  private fetchAll = (
    byAdmin: boolean,
    all: boolean,
    environment: UserEnvironment,
    forWho: NotificationForWho
  ) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      let notifications
      if (byAdmin && !all) {
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

      return new SuccessResponse('Notification deleted successfully', {
        notification,
      }).send(res)
    })
}

export default NotificationController
