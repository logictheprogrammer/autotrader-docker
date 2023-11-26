import { IUser, IUserObject, IUserService } from '@/modules/user/user.interface'
import { UserAccount, UserRole, UserStatus } from '@/modules/user/user.enum'
import { Service, Inject } from 'typedi'
import { IActivityService } from '@/modules/activity/activity.interface'
import {
  ActivityCategory,
  ActivityForWho,
} from '@/modules/activity/activity.enum'
import { IMailService } from '@/modules/mail/mail.interface'
import renderFile from '@/utils/renderFile'
import { MailOptionName } from '@/modules/mailOption/mailOption.enum'
import { SiteConstants } from '@/modules/config/config.constants'
import { FilterQuery } from 'mongoose'
import ServiceToken from '@/core/serviceToken'
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  RequestConflictError,
} from '@/core/apiError'
import Helpers from '@/utils/helpers'
import UserModel from '@/modules/user/user.model'
import ActivityModel from '@/modules/activity/activity.model'
import NotificationModel from '@/modules/notification/notification.model'
import ImageFile from '../imageFile/imageFile.service'

@Service()
class UserService implements IUserService {
  private userModel = UserModel
  private notificationModel = NotificationModel
  private activityModel = ActivityModel
  private imageFile = new ImageFile()

  static profileImageSizes = [
    { name: 'main', width: 164, height: 164 },
    { name: 'card', width: 100, height: 100 },
    { name: 'nav', width: 50, height: 50 },
    { name: 'icon', width: 24, height: 24 },
  ]

  static coverImageSizes = [
    { name: 'main', width: 1920, height: 320 },
    { name: 'profile', width: 600, height: 100 },
    { name: 'card', width: 340, height: 100 },
    { name: 'menu', width: 240, height: 42 },
  ]

  public constructor(
    @Inject(ServiceToken.ACTIVITY_SERVICE)
    private activityService: IActivityService,
    @Inject(ServiceToken.MAIL_SERVICE) private mailService: IMailService
  ) {}

  private async setFund(
    user: IUser,
    account: UserAccount,
    amount: number
  ): Promise<IUserObject> {
    if (isNaN(amount) || amount === 0)
      throw new BadRequestError('Invalid amount')

    if (!Object.values(UserAccount).includes(account))
      throw new BadRequestError('Invalid account')

    user[account] += +amount

    if (user[account] < 0)
      throw new BadRequestError(
        `Insufficient balance in ${Helpers.fromCamelToTitleCase(
          account
        )} Account`
      )

    await user.save()

    return user.toJSON()
  }

  public async fund(
    filter: FilterQuery<IUser>,
    account: UserAccount,
    amount: number
  ): Promise<IUserObject> {
    const user = await this.userModel.findOne(filter)

    if (!user) throw new NotFoundError('User not found')

    const fundedUser = await this.setFund(user, account, amount)

    return fundedUser
  }

  public async fetchAll(filter: FilterQuery<IUser>): Promise<IUserObject[]> {
    return await this.userModel.find(filter)
  }

  public async fetch(filter: FilterQuery<IUser>): Promise<IUserObject> {
    const user = await this.userModel.findOne(filter)

    if (!user) throw new NotFoundError('User not found')

    return user
  }

  public async updateProfile(
    filter: FilterQuery<IUser>,
    name: string,
    username: string,
    byAdmin: boolean
  ): Promise<IUserObject> {
    const user = await this.userModel.findOne(filter)

    if (!user) throw new NotFoundError('User not found')

    const usernameExit = await this.userModel.findOne({
      username,
      _id: { $ne: user._id },
    })

    if (usernameExit)
      throw new RequestConflictError('A user with this username already exist')

    if (byAdmin && user.role >= UserRole.ADMIN)
      throw new ForbiddenError('This action can not be performed on an admin')

    user.name = name
    user.username = username
    await user.save()

    this.activityService.create(
      user,
      ActivityForWho.USER,
      ActivityCategory.PROFILE,
      'You updated your profile details'
    )

    return user
  }

  public async updateProfileImages(
    filter: FilterQuery<IUser>,
    profile?: string,
    cover?: string
  ): Promise<IUserObject> {
    const user = await this.userModel.findOne(filter)

    if (!user) throw new NotFoundError('User not found')

    if (profile) {
      this.imageFile.delete('profile', profile)
      if (user.profile) {
        this.imageFile.delete('profile', user.profile)
      }
      user.profile = profile
    }

    if (cover) {
      this.imageFile.delete('cover', cover)
      if (user.cover) {
        this.imageFile.delete('cover', user.cover)
      }
      user.cover = cover
    }

    await user.save()

    this.activityService.create(
      user,
      ActivityForWho.USER,
      ActivityCategory.PROFILE,
      'You updated your profile details'
    )

    return user
  }

  public async updateEmail(
    filter: FilterQuery<IUser>,
    email: string
  ): Promise<IUserObject> {
    const user = await this.userModel.findOne(filter)
    if (!user) throw new NotFoundError('User not found')

    const emailExit = await this.userModel.findOne({
      email,
      _id: { $ne: user._id },
    })

    if (emailExit)
      throw new RequestConflictError('A user with this email already exist')

    user.email = email
    await user.save()

    this.activityService.create(
      user,
      ActivityForWho.USER,
      ActivityCategory.PROFILE,
      'Your updated your email address'
    )

    return user
  }

  public async updateStatus(
    filter: FilterQuery<IUser>,
    status: UserStatus
  ): Promise<IUserObject> {
    const user = await this.userModel.findOne(filter)
    if (!user) throw new NotFoundError('User not found')

    if (user.role >= UserRole.ADMIN && status === UserStatus.SUSPENDED)
      throw new BadRequestError('Users with admin role can not be suspended')

    user.status = status
    await user.save()

    return user
  }

  public async delete(filter: FilterQuery<IUser>): Promise<IUserObject> {
    const user = await this.userModel.findOne(filter)
    if (!user) throw new NotFoundError('User not found')

    if (user.role >= UserRole.ADMIN)
      throw new BadRequestError('Users with admin role can not be deleted')

    await this.userModel.deleteOne({ _id: user._id })

    await this.notificationModel.deleteMany({ user: user._id })

    await this.activityModel.deleteMany({ user: user._id })

    return user
  }

  public async sendEmail(
    filter: FilterQuery<IUser>,
    subject: string,
    heading: string,
    content: string
  ): Promise<IUserObject> {
    const user = await this.userModel.findOne(filter)
    if (!user) throw new NotFoundError('User not found')

    this.mailService.setSender(MailOptionName.TEST)

    const emailContent = await renderFile('email/custom', {
      heading,
      content,
      config: SiteConstants,
    })

    this.mailService.sendMail({
      subject: subject,
      to: user.email,
      text: Helpers.clearHtml(emailContent),
      html: emailContent,
    })

    return user
  }

  public async count(filter: FilterQuery<IUser>): Promise<number> {
    return await this.userModel.count(filter)
  }
}

export default UserService
