import { IResetPasswordService } from '@/modules/resetPassword/resetPassword.interface'
import resetPasswordModel from '@/modules/resetPassword/resetPassword.model'
import { Service } from 'typedi'
import { IUser } from '@/modules/user/user.interface'
import { SiteConstants } from '@/modules/config/config.constants'
import Cryptograph from '@/core/cryptograph'
import { BadRequestError, ServiceError } from '@/core/apiError'

@Service()
class resetPasswordService implements IResetPasswordService {
  private resetPasswordModel = resetPasswordModel

  public async create(user: IUser): Promise<string> {
    const key = user.key
    const token = Cryptograph.randomBytes(32).toString('hex')
    const expires =
      new Date().getTime() + SiteConstants.resetPasswordExpiresTime
    const resetLink = `${SiteConstants.frontendLink}reset-password/${key}/${token}`

    await this.resetPasswordModel.deleteMany({ key })
    await this.resetPasswordModel.create({
      key,
      token,
      expires,
    })

    return resetLink
  }

  public async verify(key: string, verifyToken: string): Promise<void> {
    try {
      const resetPassword = await this.resetPasswordModel.findOne({
        key,
      })

      if (!resetPassword) throw new BadRequestError('Invalid or expired token')

      const expires = resetPassword.expires

      if (expires < new Date().getTime()) {
        resetPassword.deleteOne()
        throw new BadRequestError('Invalid or expired token')
      }

      if (!(await resetPassword.isValidToken(verifyToken)))
        throw new BadRequestError('Invalid or expired token')

      resetPassword.deleteOne()
    } catch (err) {
      throw new ServiceError(err, 'Unable to change password, please try again')
    }
  }
}

export default resetPasswordService
