import { Document, Types } from 'mongoose'
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
    withdrawalId: Types.ObjectId,
    status: WithdrawalStatus
  ): TTransaction<IWithdrawalObject, IWithdrawal>

  get(
    withdrawalId: Types.ObjectId,
    isAdmin: boolean,
    userId?: Types.ObjectId
  ): Promise<IWithdrawalObject>

  create(
    withdrawalMethodId: Types.ObjectId,
    userId: Types.ObjectId,
    account: UserAccount,
    address: string,
    amount: number
  ): THttpResponse<{ withdrawal: IWithdrawal }>

  fetch(
    isAdmin: boolean,
    withdrawalId: Types.ObjectId,
    userId?: Types.ObjectId
  ): THttpResponse<{ withdrawal: IWithdrawal }>

  fetchAll(
    all: boolean,
    userId?: Types.ObjectId
  ): THttpResponse<{ withdrawals: IWithdrawal[] }>

  delete(
    withdrawalId: Types.ObjectId
  ): THttpResponse<{ withdrawal: IWithdrawal }>

  updateStatus(
    withdrawalId: Types.ObjectId,
    status: WithdrawalStatus
  ): THttpResponse<{ withdrawal: IWithdrawal }>
}
