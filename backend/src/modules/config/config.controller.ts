import { Service } from 'typedi'
import { Response, Router } from 'express'
import { SiteConstants } from '@/modules/config/config.constants'
import { IController, IControllerRoute } from '@/core/utils'
import { SuccessResponse } from '@/core/apiResponse'
import asyncHandler from '@/helpers/asyncHandler'
import BaseController from '@/core/baseContoller'

@Service()
export default class ConfigController
  extends BaseController
  implements IController
{
  public path = '/configurations'
  public routes: IControllerRoute[] = [
    [
      'get',
      `${this.path}/constants`,
      (...params) => this.getConstants(...params),
    ],
  ]

  constructor() {
    super()
    this.initialiseRoutes()
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
