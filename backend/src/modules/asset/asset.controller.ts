import { IAssetService } from '@/modules/asset/asset.interface'
import { Inject, Service } from 'typedi'
import { Router, Request, Response, NextFunction } from 'express'
import validate from '@/modules/asset/asset.validation'
import ServiceToken from '@/utils/enums/serviceToken'
import { IAppController } from '@/modules/app/app.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserRole } from '@/modules/user/user.enum'
import HttpException from '@/modules/http/http.exception'

@Service()
class AssetController implements IAppController {
  public path = '/asset'
  public router = Router()

  constructor(
    @Inject(ServiceToken.ASSET_SERVICE)
    private assetService: IAssetService
  ) {
    this.intialiseRoutes()
  }

  private intialiseRoutes(): void {
    this.router.post(
      `${this.path}/create`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.create),
      this.create
    )

    this.router.put(
      `${this.path}/update`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.update),
      this.update
    )

    this.router.get(
      `${this.path}`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      this.fetchAll
    )
  }

  private fetchAll = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const response = await this.assetService.fetchAll()
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }

  private create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { name, symbol, logo, type } = req.body
      const response = await this.assetService.create(name, symbol, logo, type)
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
      const { assetId, name, symbol, logo, type } = req.body
      const response = await this.assetService.update(
        assetId,
        name,
        symbol,
        logo,
        type
      )
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }
}

export default AssetController
