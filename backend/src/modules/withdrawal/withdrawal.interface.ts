import { WithdrawalStatus } from '@/modules/withdrawal/withdrawal.enum'
import {
  IWithdrawalMethod,
  IWithdrawalMethodObject,
} from '@/modules/withdrawalMethod/withdrawalMethod.interface'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { IAppObject } from '@/modules/app/app.interface'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { UserAccount } from '@/modules/user/user.enum'
import { Document, ObjectId, Types } from 'mongoose'

export interface IWithdrawalObject extends IAppObject {
  withdrawalMethod: IWithdrawalMethod['_id']
  withdrawalMethodObject: IWithdrawalMethodObject
  user: IUser['_id']
  userObject: IUser
  account: UserAccount
  address: string
  status: WithdrawalStatus
  amount: number
  fee: number
}

export interface IWithdrawal extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  withdrawalMethod: IWithdrawalMethod['_id']
  withdrawalMethodObject: IWithdrawalMethodObject
  user: IUser['_id']
  userObject: IUser
  account: UserAccount
  address: string
  status: WithdrawalStatus
  amount: number
  fee: number
}

export interface IWithdrawalService {
  _createTransaction(
    withdrawalMethod: IWithdrawalMethodObject,
    user: IUserObject,
    account: UserAccount,
    address: string,
    amount: number
  ): TTransaction<IWithdrawalObject, IWithdrawal>

  _updateStatusTransaction(
    withdrawalId: ObjectId | Types.ObjectId,
    status: WithdrawalStatus
  ): TTransaction<IWithdrawalObject, IWithdrawal>

  get(
    withdrawalId: ObjectId,
    isAdmin: boolean,
    userId?: ObjectId
  ): Promise<IWithdrawalObject>

  create(
    withdrawalMethodId: ObjectId,
    userId: ObjectId,
    account: UserAccount,
    address: string,
    amount: number
  ): THttpResponse<{ withdrawal: IWithdrawal }>

  fetch(
    isAdmin: boolean,
    withdrawalId: ObjectId,
    userId?: ObjectId
  ): THttpResponse<{ withdrawal: IWithdrawal }>

  fetchAll(
    all: boolean,
    userId?: ObjectId
  ): THttpResponse<{ withdrawals: IWithdrawal[] }>

  delete(withdrawalId: ObjectId): THttpResponse<{ withdrawal: IWithdrawal }>

  updateStatus(
    withdrawalId: ObjectId,
    status: WithdrawalStatus
  ): THttpResponse<{ withdrawal: IWithdrawal }>
}
