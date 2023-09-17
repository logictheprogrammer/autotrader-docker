import { ReferralTypes } from '@/modules/referral/referral.enum'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { Document, ObjectId } from 'mongoose'
import { THttpResponse } from '@/modules/http/http.type'
import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import { ITransaction } from '@/modules/transaction/transaction.interface'
import { INotification } from '@/modules/notification/notification.interface'
import { IAppObject } from '@/modules/app/app.interface'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'

export interface IReferralObject extends IAppObject {
  rate: number
  type: ReferralTypes
  referrer: IUser['_id']
  user: IUser['_id']
  userObject: IUserObject
  referrerObject: IUserObject
  amount: number
}

export interface IReferral extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  rate: number
  type: ReferralTypes
  referrer: IUser['_id']
  user: IUser['_id']
  userObject: IUserObject
  referrerObject: IUserObject
  amount: number
}

export interface IReferralEarnings {
  user: {
    username: string
    _id: ObjectId
    createdAt: Date
  }
  referrer: {
    username: string
    _id: ObjectId
  }
  earnings: number
}

export interface IReferralLeaderboard {
  user: {
    username: string
    _id: ObjectId
    createdAt: Date
  }
  earnings: number
}

export interface IReferralService {
  _calcAmountEarn(
    type: ReferralTypes,
    amount: number
  ): Promise<{ earn: number; rate: number }>

  _createTransaction(
    referrer: IUserObject,
    user: IUserObject,
    type: ReferralTypes,
    rate: number,
    earn: number
  ): TTransaction<IReferralObject, IReferral>

  create(
    type: ReferralTypes,
    user: IUserObject,
    amount: number
  ): Promise<
    ITransactionInstance<IReferral | ITransaction | INotification | IUser>[]
  >

  fetchAll(
    fromAllAccounts: boolean,
    userId?: ObjectId
  ): THttpResponse<{ referralTransactions: IReferral[] }>

  earnings(
    fromAllAccounts: boolean,
    userId?: ObjectId
  ): THttpResponse<{ referralEarnings: IReferralEarnings[] }>

  leaderboard(): THttpResponse<{ referralLeaderboard: IReferralLeaderboard[] }>
}
