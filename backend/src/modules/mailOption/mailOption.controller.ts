import { IMailOptionService } from '@/modules/mailOption/mailOption.interface'
import { Service, Inject } from 'typedi'
import validate from '@/modules/mailOption/mailOption.validation'
import { Response, Router } from 'express'
import { UserRole } from '@/modules/user/user.enum'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessCreatedResponse } from '@/core/apiResponse'
import ServiceToken from '@/core/serviceToken'
import { IController } from '@/core/utils'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'

@Service()
export default class MailOptionController implements IController {
  public path = '/mail-options'
  public router = Router()

  constructor(
    @Inject(ServiceToken.MAIL_OPTION_SERVICE)
    private mailOptionService: IMailOptionService
  ) {
    this.initialiseRoutes()
  }

  private initialiseRoutes = (): void => {
    this.router.post(
      `${this.path}/create`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.create),
      this.create
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
}
