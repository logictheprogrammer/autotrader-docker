import { Response, Router } from 'express'
import { Inject, Service } from 'typedi'
import { IActivityService } from '@/modules/activity/activity.interface'
import { ActivityForWho } from '@/modules/activity/activity.enum'
import { UserRole } from '@/modules/user/user.enum'
import { ObjectId } from 'mongoose'
import { IController } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import routePermission from '@/helpers/routePermission'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'

@Service()
class ActivityController implements IController {
  public path = '/activity'
  public router = Router()

  constructor(
    @Inject(ServiceToken.ACTIVITY_SERVICE)
    private activityService: IActivityService
  ) {
    this.initialiseRoutes()
  }

  private initialiseRoutes = (): void => {
    // Get Activity logs
    this.router.get(
      `${this.path}`,
      routePermission(UserRole.USER),
      this.fetchAll(UserRole.USER)
    )

    // Get Users Activity logs
    this.router.get(
      `${this.path}/users`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(UserRole.ADMIN)
    )

    // Get User Activity logs
    this.router.get(
      `${this.path}/user/:userId`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(UserRole.ADMIN, false)
    )

    // Get Admin Activity logs
    this.router.get(
      `${this.path}/master`,
      routePermission(UserRole.ADMIN),
      this.fetchAllAdmin
    )

    // Hide Activity
    this.router.patch(
      `${this.path}/hide/:activityId`,
      routePermission(UserRole.USER),
      this.hide
    )

    // Hide All Activity
    this.router.patch(
      `${this.path}/hide`,
      routePermission(UserRole.USER),
      this.hideAll
    )

    // Delete All users Activities
    this.router.delete(
      `${this.path}/delete/all`,
      routePermission(UserRole.ADMIN),
      this.deleteAll(true, ActivityForWho.USER)
    )

    // Delete All selected user Activity
    this.router.delete(
      `${this.path}/delete/user/:userId`,
      routePermission(UserRole.ADMIN),
      this.deleteAll(false, ActivityForWho.USER)
    )

    // Delete Admin Activity
    this.router.delete(
      `${this.path}/delete/admin/:activityId`,
      routePermission(UserRole.ADMIN),
      this.delete(UserRole.ADMIN, ActivityForWho.ADMIN)
    )

    // Delete All active Admin Activity
    this.router.delete(
      `${this.path}/delete/admin`,
      routePermission(UserRole.ADMIN),
      this.deleteAll(false, ActivityForWho.ADMIN)
    )

    // Delete Activity
    this.router.delete(
      `${this.path}/delete/:activityId`,
      routePermission(UserRole.ADMIN),
      this.delete(UserRole.USER, ActivityForWho.USER)
    )
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
          forWho: ActivityForWho.USER,
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
