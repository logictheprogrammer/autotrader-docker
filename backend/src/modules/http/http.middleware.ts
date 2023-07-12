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

  static validate(schema: Joi.Schema): RequestHandler {
    return async function (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> {
      const validationOptions = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      }
      try {
        const value = await schema.validateAsync(req.body, validationOptions)
        req.body = value
        next()
      } catch (e: any) {
        const errors: string[] = []
        e.details.forEach((error: Joi.ValidationErrorItem) => {
          errors.push(error.message)
        })
        res.status(400).json({
          status: HttpResponseStatus.ERROR,
          message: errors[0],
          data: { status: 400, message: errors[0], errors },
        })
      }
    }
  }

  static authenticate(role: UserRole) {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<Response | void> => {
      try {
        const bearer = req.headers.authorization
        if (!bearer || !bearer.startsWith('Bearer ')) {
          throw new HttpException(401, 'Unauthorized')
        }

        const accessToken = bearer.split('Bearer ')[1].trim()

        const payload = await Encryption.verifyToken(accessToken)

        if (!payload) {
          throw new HttpException(401, 'Unauthorized')
        }

        const user = await userModel
          .findById(payload.id)
          .select('-password')
          .exec()

        if (!user) {
          throw new HttpException(401, 'Unauthorized')
        }

        if (user.status !== UserStatus.ACTIVE) {
          throw new HttpException(401, 'Unauthorized')
        }

        if (role > user.role) {
          throw new HttpException(401, 'Unauthorized')
        }

        req.user = user
        return next()
      } catch (err) {
        return next(err)
      }
    }
  }

  public handle404Error(req: Request, res: Response, next: NextFunction) {
    const message = 'Sorry, the page you requested could not be found.'

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
