import {
  IResetPassword,
  IResetPasswordService,
} from '@/modules/resetPassword/resetPassword.interface'
import resetPasswordModel from '@/modules/resetPassword/resetPassword.model'
import { Service } from 'typedi'
import { IUser } from '@/modules/user/user.interface'
import { AppConstants } from '@/modules/app/app.constants'
import { SiteConstants } from '@/modules/config/config.constants'
import HttpException from '@/modules/http/http.exception'
import AppException from '@/modules/app/app.exception'
import AppCrypto from '../app/app.crypto'
import { ErrorCode } from '@/utils/enums/errorCodes.enum'

@Service()
class resetPasswordService implements IResetPasswordService {
  private resetPasswordModel = resetPasswordModel

  public async create(user: IUser): Promise<string> {
    const key = user.key
    const token = AppCrypto.randomBytes(32).toString('hex')
    const expires = new Date().getTime() + AppConstants.resetPasswordExpiresTime
    const resetLink = `${SiteConstants.frontendLink}reset-password/${key}/${token}`

    await this.resetPasswordModel.deleteMany({ key })
    await this.resetPasswordModel.create({
      key,
      token: await AppCrypto.setHash(token),
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
        throw new HttpException(
          ErrorCode.BAD_REQUEST,
          'Invalid or expired token'
        )

      const expires = resetPassword.expires

      if (expires < new Date().getTime()) {
        resetPassword.deleteOne()
        throw new HttpException(
          ErrorCode.BAD_REQUEST,
          'Invalid or expired token'
        )
      }

      if (!(await AppCrypto.isValidHash(verifyToken, resetPassword.token)))
        throw new HttpException(
          ErrorCode.BAD_REQUEST,
          'Invalid or expired token'
        )

      resetPassword.deleteOne()
    } catch (err) {
      throw new AppException(err, 'Unable to change password, please try again')
    }
  }
}

export default resetPasswordService
