import validate from '@/modules/sendMail/sendMail.validation'
import ServiceToken from '@/utils/enums/serviceToken'
import { NextFunction, Request, Response, Router } from 'express'
import { Inject, Service } from 'typedi'
import { ISendMailService } from '@/modules/sendMail/sendMail.interface'
import { IAppController } from '@/modules/app/app.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserRole } from '@/modules/user/user.enum'
import HttpException from '@/modules/http/http.exception'

@Service()
class SendMailController implements IAppController {
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
      `${this.path}`,
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.sendEmail),
      this.sendCustomMail
    )
  }

  private sendCustomMail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, subject, heading, content } = req.body

      const responce = await this.sendMailService.sendCustomMail(
        email,
        subject,
        heading,
        content
      )

      res.status(200).json(responce)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }
}

export default SendMailController
