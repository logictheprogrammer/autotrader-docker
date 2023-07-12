import { Document, Types } from 'mongoose'
import { DepositStatus } from '@/modules/deposit/deposit.enum'
import {
  IDepositMethod,
  IDepositMethodObject,
} from '@/modules/depositMethod/depositMethod.interface'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { IServiceObject } from '@/modules/service/service.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'

export interface IDepositObject extends IServiceObject {
  depositMethod: IDepositMethod['_id']
  depositMethodObject: IDepositMethodObject
  user: IUser['_id']
  userObject: IUserObject
  status: DepositStatus
  amount: number
  fee: number
}

export interface IDeposit extends Document {
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
    depositId: Types.ObjectId,
    status: DepositStatus
  ): TTransaction<IDepositObject, IDeposit>

  create(
    depositMethodId: Types.ObjectId,
    userId: Types.ObjectId,
    amount: number
  ): THttpResponse<{ deposit: IDeposit }>

  fetch(
    isAdmin: boolean,
    depositId: Types.ObjectId,
    userId?: Types.ObjectId
  ): THttpResponse<{ deposit: IDeposit }>

  fetchAll(
    all: boolean,
    userId?: Types.ObjectId
  ): THttpResponse<{ deposits: IDeposit[] }>

  delete(depositId: Types.ObjectId): THttpResponse<{ deposit: IDeposit }>

  updateStatus(
    depositId: Types.ObjectId,
    status: DepositStatus
  ): THttpResponse<{ deposit: IDeposit }>
}
