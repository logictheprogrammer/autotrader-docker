import { IEmailVerificationService } from '@/modules/emailVerification/emailVerification.interface'
import { Service } from 'typedi'
import { IUser } from '@/modules/user/user.interface'
import { SiteConstants } from '@/modules/config/config.constants'
import Cryptograph from '@/core/cryptograph'
import { BadRequestError } from '@/core/apiError'
import EmailVerificationModel from '@/modules/emailVerification/emailVerification.model'

@Service()
class EmailVerificationService implements IEmailVerificationService {
  private emailVerificationModel = EmailVerificationModel

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
  }
}

export default EmailVerificationService
