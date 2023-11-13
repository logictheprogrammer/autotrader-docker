import validate from '@/modules/sendMail/sendMail.validation'
import { Response, Router } from 'express'
import { Inject, Service } from 'typedi'
import { ISendMailService } from '@/modules/sendMail/sendMail.interface'
import { UserRole } from '@/modules/user/user.enum'
import { IController, IControllerRoute } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'
import BaseController from '@/core/baseContoller'

@Service()
class SendMailController extends BaseController implements IController {
  public path = '/send-email'
  public routes: IControllerRoute[] = [
    [
      'post',
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.sendEmail),
      (...params) => this.sendCustomMail(...params),
    ],
  ]

  constructor(
    @Inject(ServiceToken.SEND_MAIL_SERVICE)
    private sendMailService: ISendMailService
  ) {
    super()
    this.initialiseRoutes()
  }

  private initiaaliseRoutes = (): void => {
    // Send Email
    this.router.post(
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.sendEmail),
      this.sendCustomMail
    )
  }

  private sendCustomMail = asyncHandler(
    async (req, res): Promise<void | Response> => {
      const { email, subject, heading, content } = req.body

      await this.sendMailService.sendCustomMail(
        email,
        subject,
        heading,
        content
      )

      return new SuccessResponse('Mail sent successfully').send(res)
    }
  )
}

export default SendMailController
