import { Document, Types } from 'mongoose'
import { UserAccount, UserRole, UserStatus } from '@/modules/user/user.enum'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { THttpResponse } from '@/modules/http/http.type'
import { IServiceObject } from '@/modules/service/service.interface'

export interface IUserObject extends IServiceObject {
  key: string
  email: string
  username: string
  name: string
  country: string
  password: string
  role: UserRole
  status: UserStatus
  verifield: Boolean
  referred: Types.ObjectId
  refer: string
  mainBalance: number
  bonusBalance: number
  referralBalance: number
  demoBalance: number
  isDeleted?: boolean
}

export interface IUser extends Document {
  key: string
  email: string
  username: string
  name: string
  country: string
  password: string
  role: UserRole
  status: UserStatus
  verifield: Boolean
  referred: Types.ObjectId
  refer: string
  mainBalance: number
  bonusBalance: number
  referralBalance: number
  demoBalance: number
  isDeleted?: boolean

  isValidPassword(password: string): Promise<undefined | boolean>
}

export interface IUserService {
  _fundTransaction(
    userId: Types.ObjectId,
    account: UserAccount,
    amount: number
  ): TTransaction<IUserObject, IUser>

  get(userIdOrUsername: Types.ObjectId | string): Promise<IUserObject>

  fetch(userId: Types.ObjectId): THttpResponse<{ user: IUser }>

  fetchAll(): THttpResponse<{ users: IUser[] }>

  updateProfile(
    userId: Types.ObjectId,
    name: string,
    username: string
  ): THttpResponse<{ user: IUser }>

  updateEmail(
    userId: Types.ObjectId,
    email: string
  ): THttpResponse<{ user: IUser }>

  updateStatus(
    userId: Types.ObjectId,
    status: UserStatus
  ): THttpResponse<{ user: IUser }>

  delete(userId: Types.ObjectId): THttpResponse<{ user: IUser }>

  forceFund(
    userId: Types.ObjectId,
    account: UserAccount,
    amount: number
  ): THttpResponse<{ user: IUser }>

  fund(
    userIdOrUsername: Types.ObjectId | string,
    account: UserAccount,
    amount: number
  ): TTransaction<IUserObject, IUser>

  getReferredUsers(
    getAll: boolean,
    userId?: Types.ObjectId
  ): THttpResponse<{ users: IUser[] }>

  sendEmail(
    userId: Types.ObjectId,
    subject: string,
    heading: string,
    content: string
  ): THttpResponse
}
