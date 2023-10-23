import validate from '@/modules/sendMail/sendMail.validation'
import { Response, Router } from 'express'
import { Inject, Service } from 'typedi'
import { ISendMailService } from '@/modules/sendMail/sendMail.interface'
import { UserRole } from '@/modules/user/user.enum'
import { IController } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'

@Service()
class SendMailController implements IController {
  public path = '/send-email'
  public router = Router()

  constructor(
    @Inject(ServiceToken.SEND_MAIL_SERVICE)
    private sendMailService: ISendMailService
  ) {
    this.initialiseRoutes()
  }

  private initialiseRoutes = (): void => {
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
