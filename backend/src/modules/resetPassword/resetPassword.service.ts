import crypto from 'crypto'
import {
  IResetPassword,
  IResetPasswordService,
} from '@/modules/resetPassword/resetPassword.interface'
import resetPasswordModel from '@/modules/resetPassword/resetPassword.model'
import { Service } from 'typedi'
import { IUser } from '@/modules/user/user.interface'
import { AppConstants, SiteConstants } from '@/modules/config/constants'
import ServiceQuery from '@/modules/service/service.query'
import HttpException from '@/modules/http/http.exception'
import ServiceException from '@/modules/service/service.exception'

@Service()
class resetPasswordService implements IResetPasswordService {
  private resetPasswordModel = new ServiceQuery<IResetPassword>(
    resetPasswordModel
  )

  public async create(user: IUser): Promise<string> {
    const key = user.key
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date().getTime() + AppConstants.resetPasswordExpiresTime
    const resetLink = `${SiteConstants.siteApi}authentication/reset-password/${key}/${token}`

    await this.resetPasswordModel.self.deleteMany({ key })
    await this.resetPasswordModel.self.create({
      key,
      token,
      expires,
    })

    return resetLink
  }

  public verify = async (key: string, verifyToken: string): Promise<void> => {
    try {
      const resetPassword = await this.resetPasswordModel.findOne({
        key,
      })

      if (!resetPassword)
        throw new HttpException(422, 'Invalid or expired token')

      const expires = resetPassword.expires

      if (expires < new Date().getTime()) {
        resetPassword.deleteOne()
        throw new HttpException(422, 'Invalid or expired token')
      }

      if (!(await resetPassword.isValidToken(verifyToken)))
        throw new HttpException(422, 'Invalid or expired token')

      resetPassword.deleteOne()
    } catch (err) {
      throw new ServiceException(
        err,
        'Unable to change password, please try again'
      )
    }
  }
}

export default resetPasswordService
