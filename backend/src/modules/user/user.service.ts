import activityModel from '@/modules/activity/activity.model'
import userModel from '@/modules/user/user.model'
import { IUser, IUserObject, IUserService } from '@/modules/user/user.interface'
import { Types } from 'mongoose'
import { UserAccount, UserRole, UserStatus } from '@/modules/user/user.enum'
import { Service, Inject } from 'typedi'
import ServiceToken from '@/utils/enums/serviceToken'
import {
  IActivity,
  IActivityService,
} from '@/modules/activity/activity.interface'
import {
  ActivityCategory,
  ActivityForWho,
} from '@/modules/activity/activity.enum'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import HttpException from '@/modules/http/http.exception'
import ServiceException from '@/modules/service/service.exception'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import ServiceQuery from '@/modules/service/service.query'
import FormatNumber from '@/utils/formats/formatNumber'
import FormatString from '@/utils/formats/formatString'
import { IMailService } from '@/modules/mail/mail.interface'
import ParseString from '@/utils/parsers/parseString'
import renderFile from '@/utils/renderFile'
import { MailOptionName } from '@/modules/mailOption/mailOption.enum'
import { INotification } from '../notification/notification.interface'
import notificationModel from '../notification/notification.model'
import { SiteConstants } from '../config/constants'

@Service()
class UserService implements IUserService {
  private userModel = new ServiceQuery<IUser>(userModel)
  private notificationModel = new ServiceQuery<INotification>(notificationModel)
  private activityModel = new ServiceQuery<IActivity>(activityModel)

  public constructor(
    @Inject(ServiceToken.ACTIVITY_SERVICE)
    private activityService: IActivityService,
    @Inject(ServiceToken.MAIL_SERVICE) private mailService: IMailService
  ) {}

  private async find(
    userIdOrUsername: Types.ObjectId | string
  ): Promise<IUser> {
    let user

    user = await this.userModel
      .findOne({ username: userIdOrUsername })
      ?.select('-password')

    if (!user)
      user = await this.userModel
        .findById(userIdOrUsername)
        ?.select('-password')

    if (!user) throw new HttpException(404, 'User not found')
    return user
  }

  private setFund = async (
    user: IUser,
    account: UserAccount,
    amount: number
  ): Promise<IUser> => {
    if (isNaN(amount) || amount === 0)
      throw new HttpException(400, 'Invalid amount')

    if (!Object.values(UserAccount).includes(account))
      throw new HttpException(400, 'Invalid account')

    user[account] += +amount

    if (user[account] < 0)
      throw new HttpException(
        400,
        `insufficient balance in ${FormatString.fromCamelToTitleCase(
          account
        )} Account`
      )

    return user
  }

  public async _fundTransaction(
    userIdOrUsername: Types.ObjectId | string,
    account: UserAccount,
    amount: number
  ): TTransaction<IUserObject, IUser> {
    const user = await this.find(userIdOrUsername)

    const fundedUser = await this.setFund(user, account, amount)

    const onFailed = `${amount > 0 ? 'substract' : 'add'} ${
      amount > 0
        ? FormatNumber.toDollar(amount)
        : FormatNumber.toDollar(-amount)
    } ${amount > 0 ? 'from' : 'to'} the ${FormatString.fromCamelToTitleCase(
      account
    )} of the user with an id of (${fundedUser._id})`

    return {
      object: fundedUser.toObject(),
      instance: {
        model: fundedUser,
        onFailed,
        callback: async () => {
          const user = await this.setFund(fundedUser, account, -amount)
          await user.save()
        },
      },
    }
  }

  public fund = async (
    userIdOrUsername: Types.ObjectId | string,
    account: UserAccount,
    amount: number
  ): TTransaction<IUserObject, IUser> => {
    return await this._fundTransaction(userIdOrUsername, account, amount)
  }

  public forceFund = async (
    userId: Types.ObjectId,
    account: UserAccount,
    amount: number
  ): THttpResponse<{ user: IUser }> => {
    try {
      const user = await this.find(userId)

      const fundedUser = await this.setFund(user, account, amount)

      await fundedUser.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: `User has been ${
          amount > 0 ? 'credited' : 'debited'
        } successfully`,
        data: { user: fundedUser.toObject() },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        `Unable to ${amount > 0 ? 'credit' : 'debit'} user, please try again`
      )
    }
  }

  public fetchAll = async (): THttpResponse<{ users: IUser[] }> => {
    try {
      const users = await this.userModel.find().select('-password')

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Users fetched',
        data: {
          users,
        },
      }
    } catch (err: any) {
      throw new ServiceException(err, 'Unable to get users, please try again')
    }
  }

  public get = async (
    userIdOrUsername: Types.ObjectId | string
  ): Promise<IUserObject> => {
    return (await this.find(userIdOrUsername)).toObject()
  }

  public fetch = async (
    userId: Types.ObjectId
  ): THttpResponse<{ user: IUser }> => {
    try {
      const user = await this.find(userId)

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'User fetched',
        data: { user },
      }
    } catch (err: any) {
      throw new ServiceException(err, 'Unable to get user, please try again')
    }
  }

  public updateProfile = async (
    userId: Types.ObjectId,
    name: string,
    username: string,
    byAdmin: boolean
  ): THttpResponse<{ user: IUser }> => {
    try {
      await this.userModel.ifExist(
        {
          username,
          _id: { $ne: userId },
        },
        'Username already exist'
      )

      const user = await this.find(userId)

      if (byAdmin && user.role >= UserRole.ADMIN)
        throw new HttpException(
          409,
          'This action can not be performed on an admin'
        )

      user.name = name
      user.username = username
      await user.save()

      this.activityService.set(
        user.toObject(),
        ActivityForWho.USER,
        ActivityCategory.PROFILE,
        'Your updated your profile details'
      )

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Profile updated successfully',
        data: { user },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to update profile, please try again'
      )
    }
  }

  public updateEmail = async (
    userId: Types.ObjectId,
    email: string
  ): THttpResponse<{ user: IUser }> => {
    try {
      await this.userModel.ifExist(
        {
          email,
          _id: { $ne: userId },
        },
        'Email already exist'
      )

      const user = await this.find(userId)

      user.email = email
      await user.save()

      this.activityService.set(
        user.toObject(),
        ActivityForWho.USER,
        ActivityCategory.PROFILE,
        'Your updated your email address'
      )

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Email updated successfully',
        data: { user },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to update email, please try again'
      )
    }
  }

  public updateStatus = async (
    userId: Types.ObjectId,
    status: UserStatus
  ): THttpResponse<{ user: IUser }> => {
    try {
      if (!userId) throw new HttpException(404, 'User not found')

      const user = await this.find(userId)

      if (user.role >= UserRole.ADMIN && status === UserStatus.SUSPENDED)
        throw new HttpException(
          400,
          'Users with admin role can not be suspended'
        )

      user.status = status
      await user.save()
      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Status updated successfully',
        data: { user },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to update user status, please try again'
      )
    }
  }

  public delete = async (
    userId: Types.ObjectId
  ): THttpResponse<{ user: IUser }> => {
    try {
      const user = await this.find(userId)

      if (user.role >= UserRole.ADMIN)
        throw new HttpException(400, 'Users with admin role can not be deleted')

      await this.userModel.self.deleteOne({ _id: userId })

      await this.notificationModel.self.deleteOne({ user: userId })

      await this.activityModel.self.deleteOne({ user: userId })

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'User deleted successfully',
        data: { user },
      }
    } catch (err: any) {
      throw new ServiceException(err, 'Unable to delete user, please try again')
    }
  }

  public getReferredUsers = async (
    getAll: boolean,
    userId?: Types.ObjectId
  ): THttpResponse<{ users: IUser[] }> => {
    try {
      let users: IUser[] = []
      if (!getAll) {
        if (!userId) throw new HttpException(404, 'User not specifield')

        await this.find(userId)

        users = await this.userModel.self.find({
          referred: userId,
        })
      } else {
        users = await this.userModel.self
          .find({ referred: { $exists: true } })
          .select('-password')
      }

      return {
        status: HttpResponseStatus.SUCCESS,
        message: `Referred users fetched successfully`,
        data: { users },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to get referred users, please try again'
      )
    }
  }

  public async sendEmail(
    userId: Types.ObjectId,
    subject: string,
    heading: string,
    content: string
  ): THttpResponse {
    try {
      const user = await this.find(userId)

      this.mailService.setSender(MailOptionName.TEST)

      const emailContent = await renderFile('email/custom', {
        heading,
        content,
        config: SiteConstants,
      })

      this.mailService.sendMail({
        subject: subject,
        to: user.email,
        text: ParseString.clearHtml(emailContent),
        html: emailContent,
      })

      return {
        status: HttpResponseStatus.SUCCESS,
        message: `Email has been sent successfully`,
      }
    } catch (err: any) {
      throw new ServiceException(err, 'Unable to send email, please try again')
    }
  }
}

export default UserService
