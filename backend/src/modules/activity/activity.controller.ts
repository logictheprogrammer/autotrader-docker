import { Response, Router } from 'express'
import { Inject, Service } from 'typedi'
import { IActivityService } from '@/modules/activity/activity.interface'
import {
  ActivityForWho,
  ActivityStatus,
} from '@/modules/activity/activity.enum'
import { UserRole } from '@/modules/user/user.enum'
import { ObjectId } from 'mongoose'
import { IController, IControllerRoute } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import routePermission from '@/helpers/routePermission'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'
import BaseController from '@/core/baseContoller'

@Service()
class ActivityController extends BaseController implements IController {
  public path = '/activity'
  public routes: IControllerRoute[] = [
    [
      'get',
      `${this.path}`,
      routePermission(UserRole.USER),
      (...params) => this.fetchAll(UserRole.USER)(...params),
    ],
    [
      'patch',
      `${this.path}/hide/all`,
      routePermission(UserRole.USER),
      (...params) => this.hideAll(...params),
    ],
    [
      'patch',
      `${this.path}/hide/:activityId`,
      routePermission(UserRole.USER),
      (...params) => this.hide(...params),
    ],
    [
      'get',
      `/master${this.path}/users`,
      routePermission(UserRole.ADMIN),
      (...params) => this.fetchAll(UserRole.ADMIN)(...params),
    ],
    [
      'get',
      `/master${this.path}/user/:userId`,
      routePermission(UserRole.ADMIN),
      (...params) => this.fetchAll(UserRole.ADMIN, false)(...params),
    ],
    [
      'get',
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      (...params) => this.fetchAllAdmin(...params),
    ],
    [
      'delete',
      `/master${this.path}/delete/all/user/:userId`,
      routePermission(UserRole.ADMIN),
      (...params) => this.deleteAll(false, ActivityForWho.USER)(...params),
    ],
    [
      'delete',
      `/master${this.path}/delete/user/:activityId`,
      routePermission(UserRole.ADMIN),
      (...params) => this.delete(UserRole.USER, ActivityForWho.USER)(...params),
    ],
    [
      'delete',
      `/master${this.path}/delete/all`,
      routePermission(UserRole.ADMIN),
      (...params) => this.deleteAll(false, ActivityForWho.ADMIN)(...params),
    ],
    [
      'delete',
      `/master${this.path}/delete/all/users`,
      routePermission(UserRole.ADMIN),
      (...params) => this.deleteAll(true, ActivityForWho.USER)(...params),
    ],
    [
      'delete',
      `/master${this.path}/delete/:activityId`,
      routePermission(UserRole.ADMIN),
      (...params) =>
        this.delete(UserRole.ADMIN, ActivityForWho.ADMIN)(...params),
    ],
  ]

  constructor(
    @Inject(ServiceToken.ACTIVITY_SERVICE)
    private activityService: IActivityService
  ) {
    super()
    this.initialiseRoutes()
  }

  private fetchAll = (role: UserRole, all: boolean = true) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      let activities
      if (role >= UserRole.ADMIN && all) {
        activities = await this.activityService.fetchAll({
          forWho: ActivityForWho.USER,
        })
      } else if (role >= UserRole.ADMIN && !all) {
        const userId = req.params.userId as unknown as ObjectId
        activities = await this.activityService.fetchAll({
          forWho: ActivityForWho.USER,
          user: userId,
        })
      } else {
        const userId = req.user._id
        activities = await this.activityService.fetchAll({
          forWho: ActivityForWho.USER,
          user: userId,
          status: ActivityStatus.VISIBLE,
        })
      }

      return new SuccessResponse('Activities fetched successfully', {
        activities,
      }).send(res)
    })

  private fetchAllAdmin = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const activities = await this.activityService.fetchAll({
        forWho: ActivityForWho.ADMIN,
        user: req.user._id,
      })
      return new SuccessResponse('Activities fetched successfully', {
        activities,
      }).send(res)
    }
  )

  private hide = asyncHandler(async (req, res): Promise<Response | void> => {
    const userId = req.user._id
    const activityId = req.params.activityId as unknown as ObjectId
    const activity = await this.activityService.hide({
      user: userId,
      _id: activityId,
      forWho: ActivityForWho.USER,
    })
    return new SuccessResponse('Activity deleted successfully', {
      activity,
    }).send(res)
  })

  private hideAll = asyncHandler(async (req, res): Promise<Response | void> => {
    const userId = req.user._id
    await this.activityService.hideAll({
      user: userId,
      forWho: ActivityForWho.USER,
      status: ActivityStatus.VISIBLE,
    })
    return new SuccessResponse('Activities deleted successfully').send(res)
  })

  private delete = (role: UserRole, forWho: ActivityForWho) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      const activityId = req.params.activityId as unknown as ObjectId
      let activity
      if (role >= UserRole.ADMIN) {
        activity = await this.activityService.delete({
          user: req.user._id,
          _id: activityId,
          forWho,
        })
      } else {
        activity = await this.activityService.delete({
          _id: activityId,
          forWho,
        })
      }
      return new SuccessResponse('Activity deleted successfully', {
        activity,
      }).send(res)
    })

  private deleteAll = (fromAllAccounts: boolean, forWho: ActivityForWho) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      const userId = req.params.userId || req.user._id
      if (fromAllAccounts) {
        await this.activityService.deleteAll({
          forWho,
        })
      } else {
        await this.activityService.deleteAll({
          user: userId,
          forWho,
        })
      }
      return new SuccessResponse('Activities deleted successfully').send(res)
    })
}

export default ActivityController
