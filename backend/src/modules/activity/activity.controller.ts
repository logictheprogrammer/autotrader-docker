import ServiceToken from '@/utils/enums/serviceToken'
import { NextFunction, Request, Response, Router } from 'express'
import { Inject, Service } from 'typedi'
import { IActivityService } from '@/modules/activity/activity.interface'
import { ActivityForWho } from '@/modules/activity/activity.enum'
import { IAppController } from '@/modules/app/app.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserRole } from '@/modules/user/user.enum'
import HttpException from '@/modules/http/http.exception'
import { ObjectId } from 'mongoose'

@Service()
class ActivityController implements IAppController {
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
      HttpMiddleware.authenticate(UserRole.USER),
      this.fetchAll(UserRole.USER)
    )

    // Get Users Activity logs
    this.router.get(
      `${this.path}/users`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetchAll(UserRole.ADMIN)
    )

    // Get User Activity logs
    this.router.get(
      `${this.path}/user/:userId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetchAll(UserRole.ADMIN, false)
    )

    // Get Admin Activity logs
    this.router.get(
      `${this.path}/admin`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetchAllAdmin
    )

    // Hide Activity
    this.router.patch(
      `${this.path}/hide/:activityId`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.hide
    )

    // Hide All Activity
    this.router.patch(
      `${this.path}/hide`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.hideAll
    )

    // Delete All users Activities
    this.router.delete(
      `${this.path}/delete/all`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.deleteAll(true, ActivityForWho.USER)
    )

    // Delete All selected user Activity
    this.router.delete(
      `${this.path}/delete/user/:userId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.deleteAll(false, ActivityForWho.USER)
    )

    // Delete Admin Activity
    this.router.delete(
      `${this.path}/delete/admin/:activityId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.delete(UserRole.ADMIN, ActivityForWho.ADMIN)
    )

    // Delete All active Admin Activity
    this.router.delete(
      `${this.path}/delete/admin`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.deleteAll(false, ActivityForWho.ADMIN)
    )

    // Delete Activity
    this.router.delete(
      `${this.path}/delete/:activityId`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.delete(UserRole.USER, ActivityForWho.USER)
    )
  }

  private fetchAll =
    (role: UserRole, all: boolean = true) =>
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        let response
        if (role >= UserRole.ADMIN && all) {
          response = await this.activityService.fetchAll(
            role,
            ActivityForWho.USER
          )
        } else if (role >= UserRole.ADMIN && !all) {
          const userId = req.params.userId as unknown as ObjectId
          response = await this.activityService.fetchAll(
            role,
            ActivityForWho.USER,
            userId
          )
        } else {
          const userId = req.user._id
          response = await this.activityService.fetchAll(
            role,
            ActivityForWho.USER,
            userId
          )
        }
        res.status(200).json(response)
      } catch (err: any) {
        next(new HttpException(err.status, err.message, err.statusStrength))
      }
    }

  private fetchAllAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const response = await this.activityService.fetchAll(
        UserRole.ADMIN,
        ActivityForWho.ADMIN,
        req.user._id
      )
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private hide = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const userId = req.user._id
      const activityId = req.params.activityId as unknown as ObjectId
      const response = await this.activityService.hide(
        userId,
        activityId,
        ActivityForWho.USER
      )
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private hideAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const userId = req.user._id
      const response = await this.activityService.hideAll(
        userId,
        ActivityForWho.USER
      )
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private delete =
    (role: UserRole, forWho: ActivityForWho) =>
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        const activityId = req.params.activityId as unknown as ObjectId
        let response
        if (role >= UserRole.ADMIN) {
          response = await this.activityService.delete(
            activityId,
            forWho,
            req.user._id
          )
        } else {
          response = await this.activityService.delete(activityId, forWho)
        }
        res.status(200).json(response)
      } catch (err: any) {
        next(new HttpException(err.status, err.message, err.statusStrength))
      }
    }

  private deleteAll =
    (fromAllAccounts: boolean, forWho: ActivityForWho) =>
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        const userId = req.params.userId || req.user._id

        const response = await this.activityService.deleteAll(
          fromAllAccounts,
          forWho,
          userId
        )
        res.status(200).json(response)
      } catch (err: any) {
        next(new HttpException(err.status, err.message, err.statusStrength))
      }
    }
}

export default ActivityController
