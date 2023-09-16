import {
  IEmailVerification,
  IEmailVerificationService,
} from '@/modules/emailVerification/emailVerification.interface'
import emailVerificationModel from '@/modules/emailVerification/emailVerification.model'
import { Service } from 'typedi'
import { IUser } from '@/modules/user/user.interface'
import { AppConstants } from '@/modules/app/app.constants'
import { SiteConstants } from '@/modules/config/config.constants'
import HttpException from '@/modules/http/http.exception'
import AppException from '@/modules/app/app.exception'
import AppCrypto from '../app/app.crypto'
import { ErrorCode } from '@/utils/enums/errorCodes.enum'

@Service()
class EmailVerificationService implements IEmailVerificationService {
  private emailVerificationModel = emailVerificationModel

  public async create(user: IUser): Promise<string> {
    const key = user.key
    const token = AppCrypto.randomBytes(32).toString('hex')
    const expires = new Date().getTime() + AppConstants.verifyEmailExpiresTime
    const verifyLink = `${SiteConstants.frontendLink}verify-email/${key}/${token}`
    await this.emailVerificationModel.deleteMany({ key })

    await this.emailVerificationModel.create({
      key,
      token: await AppCrypto.setHash(token),
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
        throw new HttpException(
          ErrorCode.BAD_REQUEST,
          'Invalid or expired token'
        )

      const expires = emailVerification.expires

      if (expires < new Date().getTime()) {
        emailVerification.deleteOne()
        throw new HttpException(
          ErrorCode.BAD_REQUEST,
          'Invalid or expired token'
        )
      }

      if (!(await AppCrypto.isValidHash(verifyToken, emailVerification.token)))
        throw new HttpException(
          ErrorCode.BAD_REQUEST,
          'Invalid or expired token'
        )

      emailVerification.deleteOne()
    } catch (err) {
      throw new AppException(err, 'Unable to verify email, please try again')
    }
  }
}

export default EmailVerificationService
