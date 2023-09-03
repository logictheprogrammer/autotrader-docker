import { UserAccount, UserRole, UserStatus } from '@/modules/user/user.enum'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { THttpResponse } from '@/modules/http/http.type'
import { IAppObject } from '@/modules/app/app.interface'
import AppDocument from '@/modules/app/app.document'
import AppObjectId from '@/modules/app/app.objectId'

export interface IUserObject extends IAppObject {
  key: string
  email: string
  username: string
  name: string
  country: string
  password: string
  role: UserRole
  status: UserStatus
  verifield: Boolean
  referred: AppObjectId
  refer: string
  mainBalance: number
  bonusBalance: number
  referralBalance: number
  demoBalance: number
  isDeleted?: boolean
}

export interface IUser extends AppDocument {
  __v: number
  updatedAt: Date
  createdAt: Date
  key: string
  email: string
  username: string
  name: string
  country: string
  password: string
  role: UserRole
  status: UserStatus
  verifield: Boolean
  referred: AppObjectId
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
    userId: AppObjectId,
    account: UserAccount,
    amount: number
  ): TTransaction<IUserObject, IUser>

  get(
    userIdOrUsername: AppObjectId | string,
    errorMessage?: string
  ): Promise<IUserObject>

  fetch(userId: AppObjectId): THttpResponse<{ user: IUser }>

  fetchAll(): THttpResponse<{ users: IUser[] }>

  updateProfile(
    userId: AppObjectId,
    name: string,
    username: string,
    isAdmin: boolean
  ): THttpResponse<{ user: IUser }>

  updateEmail(
    userId: AppObjectId,
    email: string
  ): THttpResponse<{ user: IUser }>

  updateStatus(
    userId: AppObjectId,
    status: UserStatus
  ): THttpResponse<{ user: IUser }>

  delete(userId: AppObjectId): THttpResponse<{ user: IUser }>

  forceFund(
    userId: AppObjectId,
    account: UserAccount,
    amount: number
  ): THttpResponse<{ user: IUser }>

  fund(
    userIdOrUsername: AppObjectId | string,
    account: UserAccount,
    amount: number,
    notFoundErrorMessage?: string
  ): TTransaction<IUserObject, IUser>

  getReferredUsers(
    getAll: boolean,
    userId?: AppObjectId
  ): THttpResponse<{ users: IUser[] }>

  sendEmail(
    userId: AppObjectId,
    subject: string,
    heading: string,
    content: string
  ): THttpResponse
}
