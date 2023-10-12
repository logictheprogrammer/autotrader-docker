import { Request, Response, NextFunction, RequestHandler } from 'express'
import Joi from 'joi'
import userModel from '@/modules/user/user.model'
import { UserRole, UserStatus } from '@/modules/user/user.enum'
import { Inject, Service } from 'typedi'

import HttpException from '@/modules/http/http.exception'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import Encryption from '@/utils/encryption'
import ServiceToken from '@/utils/enums/serviceToken'
import { ISendMailService } from '@/modules/sendMail/sendMail.interface'

@Service()
export default class HttpMiddleware {
  constructor(
    @Inject(ServiceToken.SEND_MAIL_SERVICE)
    private sendMailService: ISendMailService
  ) {}

  public handle404Error(req: Request, res: Response, next: NextFunction) {
    const message = 'Sorry, the resourse you requested could not be found.'

    res
      .status(404)
      .json({ status: HttpResponseStatus.ERROR, message, errors: [message] })
  }

  public handleThrownError(
    error: HttpException,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!error.status || error.status === 500) {
      this.sendMailService.sendDeveloperErrorMail(error)
    }

    const status = error.status || 500
    const message = error.status
      ? error.message
      : 'Something went wrong, please try again later'

    const statusStrength = error.statusStrength || HttpResponseStatus.ERROR

    res.status(status).json({
      status: statusStrength,
      message,
      data: { status, message, errors: [message] },
    })
  }
}
