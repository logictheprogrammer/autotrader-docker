import { UserAccount, UserRole, UserStatus } from '@/modules/user/user.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'

export interface IUserObject extends baseObjectInterface {
  email: string
  username: string
  name: string
  country: string
  profile?: string
  cover?: string
  role: UserRole
  status: UserStatus
  verifield: Boolean
  referred: ObjectId
  refer: string
  mainBalance: number
  bonusBalance: number
  referralBalance: number
  demoBalance: number
}

// @ts-ignore
export interface IUser extends baseModelInterface, IUserObject {
  key: string
  password: string
  isValidPassword(password: string): Promise<boolean>
}

export interface IUserService {
  fetch(filter: FilterQuery<IUser>): Promise<IUserObject>

  fetchAll(filter: FilterQuery<IUser>): Promise<IUserObject[]>

  updateProfile(
    filter: FilterQuery<IUser>,
    name: string,
    username: string,
    byAdmin: boolean
  ): Promise<IUserObject>

  updateProfileImages(
    filter: FilterQuery<IUser>,
    profile?: string,
    cover?: string
  ): Promise<IUserObject>

  updateEmail(filter: FilterQuery<IUser>, email: string): Promise<IUserObject>

  updateStatus(
    filter: FilterQuery<IUser>,
    status: UserStatus
  ): Promise<IUserObject>

  delete(filter: FilterQuery<IUser>): Promise<IUserObject>

  count(filter: FilterQuery<IUser>): Promise<number>

  fund(
    filter: FilterQuery<IUser>,
    account: UserAccount,
    amount: number
  ): Promise<IUserObject>

  sendEmail(
    filter: FilterQuery<IUser>,
    subject: string,
    heading: string,
    content: string
  ): Promise<IUserObject>
}
