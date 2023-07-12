import { Document } from 'mongoose'
import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import { IUser, IUserObject } from '@/modules/user/user.interface'

import { Types } from 'mongoose'
import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { IServiceObject } from '@/modules/service/service.interface'
import { TTransaction } from '../transactionManager/transactionManager.type'
import { UserEnvironment } from '../user/user.enum'
import { TransactionStatus } from './transaction.type'

export interface ITransactionObject extends IServiceObject {
  user: IUser['_id']
  userObject: IUserObject
  status: TransactionStatus
  categoryName: TransactionCategory
  category: Document['_id']
  categoryObject: IServiceObject
  amount: number
  stake: number
  environment: UserEnvironment
}

export interface ITransaction extends Document {
  user: IUser['_id']
  userObject: IUserObject
  status: TransactionStatus
  categoryName: TransactionCategory
  category: Document['_id']
  categoryObject: IServiceObject
  amount: number
  stake: number
  environment: UserEnvironment
}

export interface ITransactionService {
  _createTransaction<T extends IServiceObject>(
    user: IUserObject,
    status: TransactionStatus,
    categoryName: TransactionCategory,
    categoryObject: T,
    amount: number,
    environment: UserEnvironment,
    stake?: number
  ): TTransaction<ITransactionObject, ITransaction>

  _updateStatusTransaction(
    categoryId: Types.ObjectId,
    status: TransactionStatus
  ): TTransaction<ITransactionObject, ITransaction>

  _updateAmountTransaction(
    categoryId: Types.ObjectId,
    status: TransactionStatus,
    amount: number
  ): TTransaction<ITransactionObject, ITransaction>

  create(
    user: IUserObject,
    status: TransactionStatus,
    categoryName: TransactionCategory,
    categoryObject: IServiceObject,
    amount: number,
    environment: UserEnvironment,
    stake?: number
  ): Promise<ITransactionInstance<ITransaction>>

  updateAmount(
    categoryId: Types.ObjectId,
    status: TransactionStatus,
    amount: number
  ): Promise<ITransactionInstance<ITransaction>>

  updateStatus(
    categoryId: Types.ObjectId,
    status: TransactionStatus
  ): Promise<ITransactionInstance<ITransaction>>

  forceUpdateAmount(
    transactionId: Types.ObjectId,
    status: TransactionStatus,
    amount: number
  ): THttpResponse<{ transaction: ITransaction }>

  forceUpdateStatus(
    transactionId: Types.ObjectId,
    status: TransactionStatus
  ): THttpResponse<{ transaction: ITransaction }>

  get(
    transactionId: Types.ObjectId,
    isAdmin: boolean,
    userId?: Types.ObjectId
  ): Promise<ITransactionObject>

  fetch(
    transactionId: Types.ObjectId,
    userId: Types.ObjectId
  ): THttpResponse<{ transaction: ITransaction }>

  fetchAll(
    all: boolean,
    environment: UserEnvironment,
    userId?: Types.ObjectId
  ): THttpResponse<{ transactions: ITransaction[] }>

  delete(
    transactionId: Types.ObjectId
  ): THttpResponse<{ transaction: ITransaction }>
}
