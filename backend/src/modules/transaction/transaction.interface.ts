import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import { IUser, IUserObject } from '@/modules/user/user.interface'

import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { IAppObject } from '@/modules/app/app.interface'
import { TTransaction } from '../transactionManager/transactionManager.type'
import { UserEnvironment } from '../user/user.enum'
import { TransactionStatus } from './transaction.type'
import { Document, ObjectId, Types } from 'mongoose'

export interface ITransactionObject extends IAppObject {
  user: IUser['_id']
  userObject: IUserObject
  status: TransactionStatus
  categoryName: TransactionCategory
  category: Document['_id']
  categoryObject: IAppObject
  amount: number
  stake: number
  environment: UserEnvironment
}

export interface ITransaction extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  user: IUser['_id']
  userObject: IUserObject
  status: TransactionStatus
  categoryName: TransactionCategory
  category: Document['_id']
  categoryObject: IAppObject
  amount: number
  stake: number
  environment: UserEnvironment
}

export interface ITransactionService {
  _createTransaction<T extends IAppObject>(
    user: IUserObject,
    status: TransactionStatus,
    categoryName: TransactionCategory,
    categoryObject: T,
    amount: number,
    environment: UserEnvironment,
    stake?: number
  ): TTransaction<ITransactionObject, ITransaction>

  _updateStatusTransaction(
    categoryId: ObjectId | Types.ObjectId,
    status: TransactionStatus
  ): TTransaction<ITransactionObject, ITransaction>

  _updateAmountTransaction(
    categoryId: ObjectId | Types.ObjectId,
    status: TransactionStatus,
    amount: number
  ): TTransaction<ITransactionObject, ITransaction>

  create(
    user: IUserObject,
    status: TransactionStatus,
    categoryName: TransactionCategory,
    categoryObject: IAppObject,
    amount: number,
    environment: UserEnvironment,
    stake?: number
  ): Promise<ITransactionInstance<ITransaction>>

  updateAmount(
    categoryId: ObjectId,
    status: TransactionStatus,
    amount: number
  ): Promise<ITransactionInstance<ITransaction>>

  updateStatus(
    categoryId: ObjectId,
    status: TransactionStatus
  ): Promise<ITransactionInstance<ITransaction>>

  forceUpdateAmount(
    transactionId: ObjectId,
    status: TransactionStatus,
    amount: number
  ): THttpResponse<{ transaction: ITransaction }>

  forceUpdateStatus(
    transactionId: ObjectId,
    status: TransactionStatus
  ): THttpResponse<{ transaction: ITransaction }>

  get(
    transactionId: ObjectId,
    isAdmin: boolean,
    userId?: ObjectId
  ): Promise<ITransactionObject>

  fetch(
    transactionId: ObjectId,
    userId: ObjectId
  ): THttpResponse<{ transaction: ITransaction }>

  fetchAll(
    all: boolean,
    environment: UserEnvironment,
    userId?: ObjectId
  ): THttpResponse<{ transactions: ITransaction[] }>

  delete(transactionId: ObjectId): THttpResponse<{ transaction: ITransaction }>
}
