import crypto from 'crypto'
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
import AppRepository from '../app/app.repository'
import AppCrypto from '../app/app.crypto'

@Service()
class EmailVerificationService implements IEmailVerificationService {
  private emailVerificationRepository = new AppRepository<IEmailVerification>(
    emailVerificationModel
  )

  public async create(user: IUser): Promise<string> {
    const key = user.key
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date().getTime() + AppConstants.verifyEmailExpiresTime
    const verifyLink = `${SiteConstants.frontendLink}verify-email/${key}/${token}`
    await this.emailVerificationRepository.deleteMany({ key })

    await this.emailVerificationRepository
      .create({
        key,
        token: await AppCrypto.setHash(token),
        expires,
      })
      .save()

    return verifyLink
  }

  public verify = async (key: string, verifyToken: string): Promise<void> => {
    try {
      const emailVerification = await this.emailVerificationRepository
        .findOne({
          key,
        })
        .collect()

      if (!emailVerification)
        throw new HttpException(422, 'Invalid or expired token')

      const expires = emailVerification.expires

      if (expires < new Date().getTime()) {
        emailVerification.deleteOne()
        throw new HttpException(422, 'Invalid or expired token')
      }

      if (!(await AppCrypto.isValidHash(verifyToken, emailVerification.token)))
        throw new HttpException(422, 'Invalid or expired token')

      emailVerification.deleteOne()
    } catch (err) {
      throw new AppException(err, 'Unable to verify email, please try again')
    }
  }
}

export default EmailVerificationService
