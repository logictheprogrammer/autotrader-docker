import { IMailOptionService } from '@/modules/mailOption/mailOption.interface'
import { Service, Inject } from 'typedi'
import validate from '@/modules/mailOption/mailOption.validation'
import { Response, Router } from 'express'
import { UserRole } from '@/modules/user/user.enum'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessCreatedResponse, SuccessResponse } from '@/core/apiResponse'
import ServiceToken from '@/core/serviceToken'
import { IController, IControllerRoute } from '@/core/utils'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'
import BaseController from '@/core/baseController'

@Service()
export default class MailOptionController
  extends BaseController
  implements IController
{
  public path = '/mail-options'
  public routes: IControllerRoute[] = [
    [
      'post',
      `/master${this.path}/create`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.create),
      (...params) => this.create(...params),
    ],
    [
      'get',
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      (...params) => this.fetchAll(...params),
    ],
  ]

  constructor(
    @Inject(ServiceToken.MAIL_OPTION_SERVICE)
    private mailOptionService: IMailOptionService
  ) {
    super()
    this.initializeRoutes()
  }

  private initialiseRouteas = (): void => {
    this.router.post(
      `/master${this.path}/create`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.create),
      this.create
    )

    this.router.get(
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      this.fetchAll
    )
  }

  private create = asyncHandler(async (req, res): Promise<Response | void> => {
    const { name, host, port, tls, secure, username, password } = req.body

    const mailOption = await this.mailOptionService.create(
      name,
      host,
      port,
      tls,
      secure,
      username,
      password
    )
    return new SuccessCreatedResponse('Mail option created successfully', {
      mailOption,
    }).send(res)
  })

  private fetchAll = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const mailOptions = await this.mailOptionService.fetchAll({})
      return new SuccessResponse('Mail option created successfully', {
        mailOptions,
      }).send(res)
    }
  )
}
