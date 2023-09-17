import { DepositStatus } from '@/modules/deposit/deposit.enum'
import {
  IDepositMethod,
  IDepositMethodObject,
} from '@/modules/depositMethod/depositMethod.interface'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { Document, ObjectId, Types } from 'mongoose'

export interface IDepositObject extends IAppObject {
  depositMethod: IDepositMethod['_id']
  depositMethodObject: IDepositMethodObject
  user: IUser['_id']
  userObject: IUserObject
  status: DepositStatus
  amount: number
  fee: number
}

export interface IDeposit extends Document {
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
    depositId: ObjectId | Types.ObjectId,
    status: DepositStatus
  ): TTransaction<IDepositObject, IDeposit>

  create(
    depositMethodId: ObjectId,
    userId: ObjectId,
    amount: number
  ): THttpResponse<{ deposit: IDeposit }>

  fetch(
    isAdmin: boolean,
    depositId: ObjectId,
    userId?: ObjectId
  ): THttpResponse<{ deposit: IDeposit }>

  fetchAll(
    all: boolean,
    userId?: ObjectId
  ): THttpResponse<{ deposits: IDeposit[] }>

  delete(depositId: ObjectId): THttpResponse<{ deposit: IDeposit }>

  updateStatus(
    depositId: ObjectId,
    status: DepositStatus
  ): THttpResponse<{ deposit: IDeposit }>
}
