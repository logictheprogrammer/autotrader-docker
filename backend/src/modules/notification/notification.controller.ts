import { INotificationService } from '@/modules/notification/notification.interface'
import { Inject, Service } from 'typedi'
import { Router, Request, Response, NextFunction } from 'express'
import ServiceToken from '@/utils/enums/serviceToken'
import { IAppController } from '@/modules/app/app.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserEnvironment, UserRole } from '@/modules/user/user.enum'
import HttpException from '@/modules/http/http.exception'
import AppObjectId from '../app/app.objectId'

@Service()
class NotificationController implements IAppController {
  public path = '/notification'
  public router = Router()

  constructor(
    @Inject(ServiceToken.NOTIFICATION_SERVICE)
    private notificationService: INotificationService
  ) {
    this.intialiseRoutes()
  }

  private intialiseRoutes(): void {
    this.router.delete(
      `${this.path}/delete/:notificationId`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.delete(false)
    )

    this.router.get(
      `${this.path}/demo/all`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.DEMO)
    )

    this.router.get(
      `${this.path}/all`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.LIVE)
    )

    this.router.get(
      `${this.path}/demo`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.fetchAll(false, UserEnvironment.DEMO)
    )

    this.router.get(
      `${this.path}`,
      HttpMiddleware.authenticate(UserRole.USER),
      this.fetchAll(false, UserEnvironment.LIVE)
    )
  }

  private fetchAll =
    (fromAllAccounts: boolean, environment: UserEnvironment) =>
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        const userId = req.user._id
        const response = await this.notificationService.fetchAll(
          fromAllAccounts,
          environment,
          userId
        )
        res.status(200).json(response)
      } catch (err: any) {
        next(new HttpException(err.status, err.message, err.statusStrength))
      }
    }

  private delete =
    (fromAllAccounts: boolean) =>
    async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        const notificationId = req.params
          .notificationId as unknown as AppObjectId
        const response = await this.notificationService.delete(
          fromAllAccounts,
          notificationId,
          req.user._id
        )
        res.status(200).json(response)
      } catch (err: any) {
        next(new HttpException(err.status, err.message, err.statusStrength))
      }
    }
}

export default NotificationController
