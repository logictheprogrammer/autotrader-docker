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
import AppDocument from '../app/app.document'
import AppObjectId from '../app/app.objectId'

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

export interface IWithdrawal extends AppDocument {
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
    withdrawalId: AppObjectId,
    status: WithdrawalStatus
  ): TTransaction<IWithdrawalObject, IWithdrawal>

  get(
    withdrawalId: AppObjectId,
    isAdmin: boolean,
    userId?: AppObjectId
  ): Promise<IWithdrawalObject>

  create(
    withdrawalMethodId: AppObjectId,
    userId: AppObjectId,
    account: UserAccount,
    address: string,
    amount: number
  ): THttpResponse<{ withdrawal: IWithdrawal }>

  fetch(
    isAdmin: boolean,
    withdrawalId: AppObjectId,
    userId?: AppObjectId
  ): THttpResponse<{ withdrawal: IWithdrawal }>

  fetchAll(
    all: boolean,
    userId?: AppObjectId
  ): THttpResponse<{ withdrawals: IWithdrawal[] }>

  delete(withdrawalId: AppObjectId): THttpResponse<{ withdrawal: IWithdrawal }>

  updateStatus(
    withdrawalId: AppObjectId,
    status: WithdrawalStatus
  ): THttpResponse<{ withdrawal: IWithdrawal }>
}
