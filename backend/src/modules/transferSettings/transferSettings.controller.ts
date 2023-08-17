import ServiceToken from '@/utils/enums/serviceToken'
import { Service, Inject } from 'typedi'
import validate from '@/modules/transferSettings/transferSettings.validation'
import { NextFunction, Request, Response, Router } from 'express'
import { ITransferSettingsService } from '@/modules/transferSettings/transferSettings.interface'
import { IAppController } from '@/modules/app/app.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserRole } from '@/modules/user/user.enum'
import HttpException from '@/modules/http/http.exception'

@Service()
export default class TransferSettingsController implements IAppController {
  public path = '/transfer-settings'
  public router = Router()

  constructor(
    @Inject(ServiceToken.TRANSFER_SETTINGS_SERVICE)
    private transferSettingsService: ITransferSettingsService
  ) {
    this.initialiseRoutes()
  }

  private initialiseRoutes = (): void => {
    // this.router.post(
    //   `${this.path}/create`,
    //   HttpMiddleware.authenticate(UserRole.ADMIN),
    //   HttpMiddleware.validate(validate.create),
    //   this.create
    // )

    this.router.put(
      `${this.path}/update`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.update),
      this.update
    )

    this.router.get(`${this.path}`, this.fetch)
  }

  private create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { approval, fee } = req.body

      const response = await this.transferSettingsService.create(approval, +fee)
      res.status(201).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { approval, fee } = req.body

      const response = await this.transferSettingsService.update(approval, +fee)
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private fetch = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const response = await this.transferSettingsService.fetch()
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }
}
