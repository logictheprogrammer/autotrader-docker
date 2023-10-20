import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import { IUserObject } from '@/modules/user/user.interface'
import { UserEnvironment } from '../user/user.enum'
import { TransactionStatus } from './transaction.type'
import { FilterQuery, ObjectId } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'

export interface ITransactionObject extends baseObjectInterface {
  user: IUserObject
  status: TransactionStatus
  categoryName: TransactionCategory
  category: baseObjectInterface
  amount: number
  stake: number
  environment: UserEnvironment
}

// @ts-ignore
export interface ITransaction extends baseModelInterface, ITransactionObject {}

export interface ITransactionService {
  create(
    user: IUserObject,
    status: TransactionStatus,
    categoryName: TransactionCategory,
    category: baseObjectInterface,
    amount: number,
    environment: UserEnvironment,
    stake?: number
  ): Promise<ITransactionObject>

  updateAmount(
    filter: FilterQuery<ITransaction>,
    status: TransactionStatus,
    amount: number
  ): Promise<ITransactionObject>

  updateStatus(
    filter: FilterQuery<ITransaction>,
    status: TransactionStatus
  ): Promise<ITransactionObject>

  fetch(filter: FilterQuery<ITransaction>): Promise<ITransactionObject>

  fetchAll(filter: FilterQuery<ITransaction>): Promise<ITransactionObject[]>

  delete(filter: FilterQuery<ITransaction>): Promise<ITransactionObject>
}
