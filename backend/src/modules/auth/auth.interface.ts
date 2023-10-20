import { IUser, IUserObject } from '@/modules/user/user.interface'
import { UserRole, UserStatus } from '@/modules/user/user.enum'
import { FilterQuery } from 'mongoose'

export interface IAuthService {
  register(
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
  ): Promise<{ email: string; message: string }>

  login(
    filter: FilterQuery<IUser>,
    password: string
  ): Promise<
    | { email: string; message: string }
    | { accessToken: string; expiresIn: number }
  >

  updatePassword(
    filter: FilterQuery<IUser>,
    password: string,
    oldPassword?: string
  ): Promise<IUserObject>

  verifyEmail(key: string, verifyToken: string): Promise<void>

  forgetPassword(filter: FilterQuery<IUser>): Promise<{ email: string }>

  resetPassword(
    key: string,
    verifyToken: string,
    password: string
  ): Promise<void>

  sendWelcomeMail(user: IUser): Promise<void>

  sendResetPasswordMail(
    email: string,
    username: string,
    resetLink: string
  ): Promise<void>

  sendEmailVerificationMail(
    email: string,
    username: string,
    verifyLink: string
  ): Promise<void>
}
