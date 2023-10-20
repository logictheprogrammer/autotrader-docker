import { Service } from 'typedi'
import { Response, Router } from 'express'
import { SiteConstants } from '@/modules/config/config.constants'
import { IController } from '@/core/utils'
import { SuccessResponse } from '@/core/apiResponse'
import asyncHandler from '@/helpers/asyncHandler'

@Service()
export default class ConfigController implements IController {
  public path = '/configurations'
  public router = Router()

  constructor() {
    this.initialiseRoutes()
  }

  private initialiseRoutes = (): void => {
    this.router.get(`${this.path}/constants`, this.getConstants)
  }

  private getConstants = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const constants = {
        siteName: SiteConstants.siteName,
        siteLink: SiteConstants.siteLink,
        siteApi: SiteConstants.siteApi,
        siteUrl: SiteConstants.siteUrl,
        siteEmail: SiteConstants.siteEmail,
        siteAddress: SiteConstants.siteAddress,
        sitePhone: SiteConstants.sitePhone,
      }
      return new SuccessResponse('Constants fetched successfully', {
        constants,
      }).send(res)
    }
  )
}
