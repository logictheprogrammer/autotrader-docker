import { IEmailVerificationService } from '@/modules/emailVerification/emailVerification.interface'
import emailVerificationModel from '@/modules/emailVerification/emailVerification.model'
import { Service } from 'typedi'
import { IUser } from '@/modules/user/user.interface'
import { SiteConstants } from '@/modules/config/config.constants'
import Cryptograph from '@/core/cryptograph'
import { BadRequestError, ServiceError } from '@/core/apiError'

@Service()
class EmailVerificationService implements IEmailVerificationService {
  private emailVerificationModel = emailVerificationModel

  public async create(user: IUser): Promise<string> {
    const key = user.key
    const token = Cryptograph.randomBytes(32).toString('hex')
    const expires = new Date().getTime() + SiteConstants.verifyEmailExpiresTime
    const verifyLink = `${SiteConstants.frontendLink}verify-email/${key}/${token}`
    await this.emailVerificationModel.deleteMany({ key })

    await this.emailVerificationModel.create({
      key,
      token,
      expires,
    })

    return verifyLink
  }

  public async verify(key: string, verifyToken: string): Promise<void> {
    try {
      const emailVerification = await this.emailVerificationModel.findOne({
        key,
      })

      if (!emailVerification)
        throw new BadRequestError('Invalid or expired token')

      const expires = emailVerification.expires

      if (expires < new Date().getTime()) {
        emailVerification.deleteOne()
        throw new BadRequestError('Invalid or expired token')
      }

      if (!(await emailVerification.isValidToken(verifyToken)))
        throw new BadRequestError('Invalid or expired token')

      emailVerification.deleteOne()
    } catch (err) {
      throw new ServiceError(err, 'Unable to verify email, please try again')
    }
  }
}

export default EmailVerificationService
