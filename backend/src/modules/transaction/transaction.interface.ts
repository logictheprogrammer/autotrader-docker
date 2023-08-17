import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import { IUser, IUserObject } from '@/modules/user/user.interface'

import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { IAppObject } from '@/modules/app/app.interface'
import { TTransaction } from '../transactionManager/transactionManager.type'
import { UserEnvironment } from '../user/user.enum'
import { TransactionStatus } from './transaction.type'
import AppDocument from '../app/app.document'
import AppObjectId from '../app/app.objectId'

export interface ITransactionObject extends IAppObject {
  user: IUser['_id']
  userObject: IUserObject
  status: TransactionStatus
  categoryName: TransactionCategory
  category: AppDocument['_id']
  categoryObject: IAppObject
  amount: number
  stake: number
  environment: UserEnvironment
}

export interface ITransaction extends AppDocument {
  __v: number
  updatedAt: Date
  createdAt: Date
  user: IUser['_id']
  userObject: IUserObject
  status: TransactionStatus
  categoryName: TransactionCategory
  category: AppDocument['_id']
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
    categoryId: AppObjectId,
    status: TransactionStatus
  ): TTransaction<ITransactionObject, ITransaction>

  _updateAmountTransaction(
    categoryId: AppObjectId,
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
    categoryId: AppObjectId,
    status: TransactionStatus,
    amount: number
  ): Promise<ITransactionInstance<ITransaction>>

  updateStatus(
    categoryId: AppObjectId,
    status: TransactionStatus
  ): Promise<ITransactionInstance<ITransaction>>

  forceUpdateAmount(
    transactionId: AppObjectId,
    status: TransactionStatus,
    amount: number
  ): THttpResponse<{ transaction: ITransaction }>

  forceUpdateStatus(
    transactionId: AppObjectId,
    status: TransactionStatus
  ): THttpResponse<{ transaction: ITransaction }>

  get(
    transactionId: AppObjectId,
    isAdmin: boolean,
    userId?: AppObjectId
  ): Promise<ITransactionObject>

  fetch(
    transactionId: AppObjectId,
    userId: AppObjectId
  ): THttpResponse<{ transaction: ITransaction }>

  fetchAll(
    all: boolean,
    environment: UserEnvironment,
    userId?: AppObjectId
  ): THttpResponse<{ transactions: ITransaction[] }>

  delete(
    transactionId: AppObjectId
  ): THttpResponse<{ transaction: ITransaction }>
}
