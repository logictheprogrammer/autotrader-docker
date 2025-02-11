import { IAuthService } from '@/modules/auth/auth.interface'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { Service, Inject } from 'typedi'
import { IEmailVerificationService } from '@/modules/emailVerification/emailVerification.interface'
import { IResetPasswordService } from '@/modules/resetPassword/resetPassword.interface'
import { IActivityService } from '@/modules/activity/activity.interface'
import {
  ActivityCategory,
  ActivityForWho,
} from '@/modules/activity/activity.enum'
import { UserRole, UserStatus } from '@/modules/user/user.enum'
import { IMailService } from '@/modules/mail/mail.interface'
import renderFile from '@/utils/renderFile'
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
import Cryptograph from '@/core/cryptograph'
import { StatusCode } from '@/core/apiResponse'
import UserModel from '@/modules/user/user.model'

@Service()
class AuthService implements IAuthService {
  private userModel = UserModel

  public constructor(
    @Inject(ServiceToken.MAIL_SERVICE) private mailService: IMailService,
    @Inject(ServiceToken.EMAIL_VERIFICATION_SERVICE)
    private emailVerificationService: IEmailVerificationService,
    @Inject(ServiceToken.RESET_PASSWORD_SERVICE)
    private resetPasswordService: IResetPasswordService,
    @Inject(ServiceToken.ACTIVITY_SERVICE)
    private activityService: IActivityService
  ) {}

  private async emailVerification(
    user: IUser
  ): Promise<{ email: string; message: string }> {
    const verifyLink = await this.emailVerificationService.create(user)

    const username = user.username
    const email = user.email

    await this.sendEmailVerificationMail(email, username, verifyLink)

    return {
      email: Helpers.mask(email, 2, 3),
      message:
        'Verify your email to continue, an email verification link has been sent to your email address',
    }
  }

  public async register(
    name: string,
    email: string,
    username: string,
    country: string,
    password: string,
    role: UserRole,
    status: UserStatus,
    mainBalance: number,
    referralBalance: number,
    demoBalance: number,
    bonusBalance: number,
    invite?: string
  ): Promise<{ email: string; message: string }> {
    let referred
    if (invite) {
      referred = await this.userModel.findOne({ refer: invite })
      if (!referred) throw new BadRequestError('Invalid referral code')
    }

    const refer = Cryptograph.generateCode({ length: 10 })[0]

    const emailExist = await this.userModel.findOne({ email })

    if (emailExist) throw new RequestConflictError('Email already exist')

    const usernameExist = await this.userModel.findOne({ username })

    if (usernameExist) throw new RequestConflictError('Username already exist')

    const key = Cryptograph.randomBytes(16).toString('hex')

    const user = await this.userModel.create({
      name,
      email,
      username,
      country,
      password,
      role,
      status,
      refer,
      mainBalance,
      referralBalance,
      demoBalance,
      bonusBalance,
      referred,
      key,
    })

    this.activityService.create(
      user,
      ActivityForWho.USER,
      ActivityCategory.PROFILE,
      'your account was created'
    )

    return await this.emailVerification(user)
  }

  public async login(
    filter: FilterQuery<IUser>,
    password: string
  ): Promise<
    | { email: string; message: string }
    | { accessToken: string; expiresIn: number }
  > {
    const user = await this.userModel.findOne(filter)

    if (!user)
      throw new NotFoundError(
        'Could not find a user with that Email or Username'
      )

    if (!(await user.isValidPassword(password)))
      throw new BadRequestError('Incorrect password')

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenError(
        'Your account is under review, please check in later',
        undefined,
        StatusCode.INFO
      )
    }

    if (user.verified) {
      this.activityService.create(
        user,
        ActivityForWho.USER,
        ActivityCategory.PROFILE,
        'you logged in to your account'
      )
      const accessToken = Cryptograph.createToken(user)
      const expiresIn = 1000 * 60 * 60 * 24 + new Date().getTime()
      return { accessToken, expiresIn }
    }

    return await this.emailVerification(user)
  }

  public async updatePassword(
    filter: FilterQuery<IUser>,
    password: string,
    oldPassword?: string
  ): Promise<IUserObject> {
    const user = await this.userModel.findOne(filter)

    if (!user) throw new NotFoundError('User not found')

    if (
      oldPassword &&
      !(await Cryptograph.isValidHash(oldPassword, user.password))
    )
      throw new BadRequestError('Incorrect password')

    if (!oldPassword && user.role >= UserRole.ADMIN)
      throw new ForbiddenError('This action can not be performed on an admin')

    user.password = await Cryptograph.setHash(password)

    await user.save()

    this.activityService.create(
      user,
      ActivityForWho.USER,
      ActivityCategory.PROFILE,
      'you updated your password'
    )

    return user
  }

  public async forgetPassword(
    filter: FilterQuery<IUser>
  ): Promise<{ email: string }> {
    const user = await this.userModel.findOne(filter)

    if (!user)
      throw new NotFoundError(
        'Could not find a user with that Email or Username'
      )

    const resetLink = await this.resetPasswordService.create(user)

    const username = user.username
    const email = user.email

    await this.sendResetPasswordMail(email, username, resetLink)

    return {
      email: Helpers.mask(email, 2, 3),
    }
  }

  public async resetPassword(
    key: string,
    verifyToken: string,
    password: string
  ): Promise<void> {
    await this.resetPasswordService.verify(key, verifyToken)

    const user = await this.userModel.findOne({ key }).select('-password')

    if (!user) throw new NotFoundError('User not found')

    user.password = password

    await user.save()

    this.activityService.create(
      user,
      ActivityForWho.USER,
      ActivityCategory.PROFILE,
      'you reset your password'
    )

    return
  }

  public async verifyEmail(key: string, verifyToken: string): Promise<void> {
    await this.emailVerificationService.verify(key, verifyToken)

    const user = await this.userModel.findOne({ key })

    if (!user) throw new NotFoundError('User not found')

    user.verified = true

    await user.save()

    this.sendWelcomeMail(user)

    this.activityService.create(
      user,
      ActivityForWho.USER,
      ActivityCategory.PROFILE,
      'you verified your email address'
    )

    return
  }

  public async sendWelcomeMail(user: IUser): Promise<void> {
    const name = Helpers.toTitleCase(user.name)
    const btnLink = `${SiteConstants.siteApi}users`
    const siteName = SiteConstants.siteName
    const subject = 'Welcome to ' + siteName

    const emailContent = await renderFile('email/welcome', {
      btnLink,
      name,
      siteName,
      config: SiteConstants,
    })

    this.mailService.sendMail({
      subject,
      to: user.email,
      text: Helpers.clearHtml(emailContent),
      html: emailContent,
    })
  }

  public async sendResetPasswordMail(
    email: string,
    username: string,
    resetLink: string
  ): Promise<void> {
    const subject = 'Reset Password'

    const emailContent = await renderFile('email/resetPassword', {
      resetLink,
      username,
      config: SiteConstants,
    })

    this.mailService.sendMail({
      subject,
      to: email,
      text: Helpers.clearHtml(emailContent),
      html: emailContent,
    })
  }

  public async sendEmailVerificationMail(
    email: string,
    username: string,
    verifyLink: string
  ): Promise<void> {
    const subject = 'Please verify your email'

    const emailContent = await renderFile('email/verifyEmail', {
      verifyLink,
      username,
      subject,
      config: SiteConstants,
    })

    this.mailService.sendMail({
      subject,
      to: email,
      text: Helpers.clearHtml(emailContent),
      html: emailContent,
    })
  }
}

export default AuthService
