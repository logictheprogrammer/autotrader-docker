import crypto from 'crypto'
import { IAuthService } from '@/modules/auth/auth.interface'
import userModel from '@/modules/user/user.model'
import { IUser } from '@/modules/user/user.interface'
import { Types } from 'mongoose'
import { generate } from 'referral-codes'
import { Service, Inject } from 'typedi'
import ServiceToken from '@/utils/enums/serviceToken'

import { IEmailVerificationService } from '@/modules/emailVerification/emailVerification.interface'
import { IResetPasswordService } from '@/modules/resetPassword/resetPassword.interface'
import { IActivityService } from '@/modules/activity/activity.interface'
import {
  ActivityCategory,
  ActivityForWho,
} from '@/modules/activity/activity.enum'
import { UserRole, UserStatus } from '@/modules/user/user.enum'
import { THttpResponse } from '@/modules/http/http.type'
import AppException from '@/modules/app/app.exception'
import HttpException from '@/modules/http/http.exception'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import Encryption from '@/utils/encryption'
import { IMailService } from '@/modules/mail/mail.interface'
import renderFile from '@/utils/renderFile'
import ParseString from '@/utils/parsers/parseString'
import { SiteConstants } from '@/modules/config/config.constants'
import FormatString from '@/utils/formats/formatString'
import AppRepository from '../app/app.repository'
import AppCrypto from '../app/app.crypto'

@Service()
class AuthService implements IAuthService {
  private userRepository = new AppRepository<IUser>(userModel)

  public constructor(
    @Inject(ServiceToken.MAIL_SERVICE) private mailService: IMailService,
    @Inject(ServiceToken.EMAIL_VERIFICATION_SERVICE)
    private emailVerificationService: IEmailVerificationService,
    @Inject(ServiceToken.RESET_PASSWORD_SERVICE)
    private resetPasswordService: IResetPasswordService,
    @Inject(ServiceToken.ACTIVITY_SERVICE)
    private activityService: IActivityService
  ) {}

  private emailVerification = async (
    user: IUser
  ): THttpResponse<{ email: string }> => {
    try {
      const verifyLink = await this.emailVerificationService.create(user)

      const username = user.username
      const email = user.email

      await this.sendEmailVerificationMail(email, username, verifyLink)

      return {
        status: HttpResponseStatus.INFO,
        message: 'A verification link has been sent to your email address',
        data: { email: FormatString.mask(email, 2, 3) },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Unable to send verification email, please try again'
      )
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
  ): THttpResponse<{ email: string }> {
    try {
      let referred
      if (invite) {
        referred = await this.userRepository
          .findOne({ refer: invite })
          .collect()
        if (!referred) throw new HttpException(422, 'Invalid referral code')
      }

      const refer = generate({ length: 10 })[0]

      await this.userRepository.ifExist({ email }, 'Email already exist')
      await this.userRepository.ifExist({ username }, 'Username already exist')

      const key = crypto.randomBytes(16).toString('hex')

      const user = await this.userRepository
        .create({
          name,
          email,
          username,
          country,
          password: await AppCrypto.setHash(password),
          role,
          status,
          refer,
          mainBalance,
          referralBalance,
          demoBalance,
          bonusBalance,
          referred: referred?._id,
          key,
          verifield: false,
          isDeleted: false,
        })
        .save()

      this.activityService.set(
        this.userRepository.toObject(user),
        ActivityForWho.USER,
        ActivityCategory.PROFILE,
        'your account was created'
      )

      return await this.emailVerification(user)
    } catch (err: any) {
      throw new AppException(err, 'Unable to register, please try again')
    }
  }

  public async login(
    account: string,
    password: string
  ): THttpResponse<
    { email: string } | { accessToken: string; expiresIn: number }
  > {
    try {
      const user = await this.userRepository
        .findOne({
          $or: [{ email: account }, { username: account }],
        })
        .collect()

      if (!user)
        throw new HttpException(
          404,
          'Could not find a user with that Email or Username'
        )

      if (!(await AppCrypto.isValidHash(password, user.password)))
        throw new HttpException(400, 'Incorrect password')

      if (user.status !== UserStatus.ACTIVE) {
        throw new HttpException(
          403,
          'Your account is under review, please check in later',
          HttpResponseStatus.INFO
        )
      }

      if (user.verifield) {
        const newUser = this.userRepository.toClass(user).collectUnsaved()
        this.activityService.set(
          newUser,
          ActivityForWho.USER,
          ActivityCategory.PROFILE,
          'you logged in to your account'
        )
        const accessToken = Encryption.createToken(user)
        const expiresIn = 1000 * 60 * 60 * 24 + new Date().getTime()
        return {
          status: HttpResponseStatus.SUCCESS,
          message: 'Login successful',
          data: { accessToken, expiresIn },
        }
      }

      return await this.emailVerification(user)
    } catch (err: any) {
      throw new AppException(err, 'Unable to login, please try again')
    }
  }

  public async updatePassword(
    userId: Types.ObjectId,
    password: string,
    oldPassword?: string
  ): THttpResponse<{ user: IUser }> {
    try {
      const user = await this.userRepository.findById(userId).collect()

      if (!user) throw new HttpException(404, 'User not found')

      if (
        oldPassword &&
        !(await AppCrypto.isValidHash(oldPassword, user.password))
      )
        throw new HttpException(400, 'Incorrect password')

      if (!oldPassword && user.role >= UserRole.ADMIN)
        throw new HttpException(
          409,
          'This action can not be performed on an admin'
        )

      user.password = await AppCrypto.setHash(password)

      const newUser = await this.userRepository.save(user)

      this.activityService.set(
        this.userRepository.toObject(newUser),
        ActivityForWho.USER,
        ActivityCategory.PROFILE,
        'you updated your password'
      )

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Password updated successfully',
        data: { user },
      }
    } catch (err: any) {
      throw new AppException(err, 'Unable to update password, please try again')
    }
  }

  public async forgetPassword(
    account: string
  ): THttpResponse<{ email: string }> {
    try {
      const user = await this.userRepository
        .findOne({
          $or: [{ email: account }, { username: account }],
        })
        .collect()

      if (!user)
        throw new HttpException(
          404,
          'Could not find a user with that Email or Username'
        )

      const resetLink = await this.resetPasswordService.create(user)

      const username = user.username
      const email = user.email

      await this.sendResetPasswordMail(email, username, resetLink)

      return {
        status: HttpResponseStatus.INFO,
        message: 'A reset password link has been sent to your email address',
        data: { email: FormatString.mask(email, 2, 3) },
      }
    } catch (err: any) {
      throw new AppException(err, 'Unable to reset password, please try again')
    }
  }

  public async resetPassword(
    key: string,
    verifyToken: string,
    password: string
  ): THttpResponse {
    try {
      await this.resetPasswordService.verify(key, verifyToken)

      const user = await this.userRepository
        .findOne({ key })
        .select('-password')
        .collect()

      if (!user) throw new HttpException(404, 'User not found')

      user.password = password

      const newUser = await this.userRepository.save(user)

      this.activityService.set(
        this.userRepository.toObject(newUser),
        ActivityForWho.USER,
        ActivityCategory.PROFILE,
        'you reset your password'
      )

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Password updated successfully',
        data: undefined,
      }
    } catch (err: any) {
      throw new AppException(err, 'Unable to update password, please try again')
    }
  }

  public async verifyEmail(
    key: string,
    verifyToken: string
  ): THttpResponse<{ accessToken: string }> {
    try {
      await this.emailVerificationService.verify(key, verifyToken)

      const user = await this.userRepository.findOne({ key }).collect()

      if (!user) throw new HttpException(404, 'User not found')

      user.verifield = true

      const newUser = await this.userRepository.save(user)

      const userObj = this.userRepository.toObject(newUser)

      this.sendWelcomeMail(userObj)

      this.activityService.set(
        userObj,
        ActivityForWho.USER,
        ActivityCategory.PROFILE,
        'you verifield your email address'
      )

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Email successfully verifield',
      }
    } catch (err: any) {
      throw new AppException(err, 'Unable to verify email, please try again')
    }
  }

  public async sendWelcomeMail(user: IUser): Promise<void> {
    try {
      const name = FormatString.toTitleCase(user.name)
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
        text: ParseString.clearHtml(emailContent),
        html: emailContent,
      })
    } catch (err: any) {
      throw new AppException(err, 'Failed to send email, please try again')
    }
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
      text: ParseString.clearHtml(emailContent),
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
      text: ParseString.clearHtml(emailContent),
      html: emailContent,
    })
  }
}

export default AuthService
