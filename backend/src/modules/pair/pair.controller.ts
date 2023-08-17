import { IPairService } from '@/modules/pair/pair.interface'
import { Inject, Service } from 'typedi'
import { Router, Request, Response, NextFunction } from 'express'
import validate from '@/modules/pair/pair.validation'
import ServiceToken from '@/utils/enums/serviceToken'
import { IAppController } from '@/modules/app/app.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserRole } from '@/modules/user/user.enum'
import HttpException from '@/modules/http/http.exception'

@Service()
class PairController implements IAppController {
  public path = '/pair'
  public router = Router()

  constructor(
    @Inject(ServiceToken.PAIR_SERVICE)
    private pairService: IPairService
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
      const response = await this.pairService.fetchAll()
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
      const { assetType, baseAssetId, quoteAssetId } = req.body
      const response = await this.pairService.create(
        assetType,
        baseAssetId,
        quoteAssetId
      )
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
      const { pairId, assetType, baseAssetId, quoteAssetId } = req.body
      const response = await this.pairService.update(
        pairId,
        assetType,
        baseAssetId,
        quoteAssetId
      )
      res.status(200).json(response)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }
}

export default PairController
