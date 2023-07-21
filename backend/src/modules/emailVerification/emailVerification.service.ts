import crypto from 'crypto'
import {
  IEmailVerification,
  IEmailVerificationService,
} from '@/modules/emailVerification/emailVerification.interface'
import emailVerificationModel from '@/modules/emailVerification/emailVerification.model'
import { Service } from 'typedi'
import { IUser } from '@/modules/user/user.interface'
import { AppConstants, SiteConstants } from '@/modules/config/constants'
import ServiceQuery from '@/modules/service/service.query'
import HttpException from '@/modules/http/http.exception'
import ServiceException from '@/modules/service/service.exception'

@Service()
class EmailVerificationService implements IEmailVerificationService {
  private emailVerificationModel = new ServiceQuery<IEmailVerification>(
    emailVerificationModel
  )

  public async create(user: IUser): Promise<string> {
    const key = user.key
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date().getTime() + AppConstants.verifyEmailExpiresTime
    const verifyLink = `${SiteConstants.frontendLink}verify-email/${key}/${token}`
    await this.emailVerificationModel.self.deleteMany({ key })

    await this.emailVerificationModel.self.create({
      key,
      token,
      expires,
    })

    return verifyLink
  }

  public verify = async (key: string, verifyToken: string): Promise<void> => {
    try {
      const emailVerification = await this.emailVerificationModel.findOne({
        key,
      })

      if (!emailVerification)
        throw new HttpException(422, 'Invalid or expired token')

      const expires = emailVerification.expires

      if (expires < new Date().getTime()) {
        emailVerification.deleteOne()
        throw new HttpException(422, 'Invalid or expired token')
      }

      if (!(await emailVerification.isValidToken(verifyToken)))
        throw new HttpException(422, 'Invalid or expired token')

      emailVerification.deleteOne()
    } catch (err) {
      throw new ServiceException(
        err,
        'Unable to verify email, please try again'
      )
    }
  }
}

export default EmailVerificationService
