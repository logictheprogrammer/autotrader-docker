import { Service } from 'typedi'
import { NextFunction, Request, Response, Router } from 'express'
import { SiteConstants } from '@/modules/config/constants'
import { IServiceController } from '@/modules/service/service.interface'
import { HttpResponseStatus } from '@/modules/http/http.enum'

@Service()
export default class ConfigController implements IServiceController {
  public path = '/configurations'
  public router = Router()

  constructor() {
    this.initialiseRoutes()
  }

  private initialiseRoutes = (): void => {
    this.router.get(`${this.path}/constants`, this.getConstants)
  }

  private getConstants = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const constants = {
      siteName: SiteConstants.siteName,
      siteLink: SiteConstants.siteLink,
      siteApi: SiteConstants.siteApi,
      siteUrl: SiteConstants.siteUrl,
      siteEmail: SiteConstants.siteEmail,
      siteAddress: SiteConstants.siteAddress,
      sitePhone: SiteConstants.sitePhone,
    }
    res.status(200).json({
      status: HttpResponseStatus.SUCCESS,
      message: 'Constants fetched',
      data: { constants },
    })
  }
}
