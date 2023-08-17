import { DepositStatus } from '@/modules/deposit/deposit.enum'
import {
  IDepositMethod,
  IDepositMethodObject,
} from '@/modules/depositMethod/depositMethod.interface'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import AppDocument from '../app/app.document'
import AppObjectId from '../app/app.objectId'

export interface IDepositObject extends IAppObject {
  depositMethod: IDepositMethod['_id']
  depositMethodObject: IDepositMethodObject
  user: IUser['_id']
  userObject: IUserObject
  status: DepositStatus
  amount: number
  fee: number
}

export interface IDeposit extends AppDocument {
  __v: number
  updatedAt: Date
  createdAt: Date
  depositMethod: IDepositMethod['_id']
  depositMethodObject: IDepositMethodObject
  user: IUser['_id']
  userObject: IUserObject
  status: DepositStatus
  amount: number
  fee: number
}

export interface IDepositService {
  _createTransaction(
    user: IUserObject,
    depositMethod: IDepositMethodObject,
    amount: number
  ): TTransaction<IDepositObject, IDeposit>

  _updateStatusTransaction(
    depositId: AppObjectId,
    status: DepositStatus
  ): TTransaction<IDepositObject, IDeposit>

  create(
    depositMethodId: AppObjectId,
    userId: AppObjectId,
    amount: number
  ): THttpResponse<{ deposit: IDeposit }>

  fetch(
    isAdmin: boolean,
    depositId: AppObjectId,
    userId?: AppObjectId
  ): THttpResponse<{ deposit: IDeposit }>

  fetchAll(
    all: boolean,
    userId?: AppObjectId
  ): THttpResponse<{ deposits: IDeposit[] }>

  delete(depositId: AppObjectId): THttpResponse<{ deposit: IDeposit }>

  updateStatus(
    depositId: AppObjectId,
    status: DepositStatus
  ): THttpResponse<{ deposit: IDeposit }>
}
