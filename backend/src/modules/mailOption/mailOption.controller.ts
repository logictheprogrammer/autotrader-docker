import { IMailOptionService } from '@/modules/mailOption/mailOption.interface'
import ServiceToken from '@/utils/enums/serviceToken'
import { Service, Inject } from 'typedi'
import validate from '@/modules/mailOption/mailOption.validation'
import { NextFunction, Request, Response, Router } from 'express'
import { IAppController } from '@/modules/app/app.interface'
import HttpMiddleware from '@/modules/http/http.middleware'
import { UserRole } from '@/modules/user/user.enum'
import HttpException from '@/modules/http/http.exception'

@Service()
export default class MailOptionController implements IAppController {
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
      HttpMiddleware.authenticate(UserRole.ADMIN),
      HttpMiddleware.validate(validate.create),
      this.create
    )
  }

  private create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
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
      res.status(201).json(mailOption)
    } catch (err: any) {
      next(new HttpException(err.status, err.message, err.statusStrength))
    }
  }
}
