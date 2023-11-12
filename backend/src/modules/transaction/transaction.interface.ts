import { TransactionTitle } from '@/modules/transaction/transaction.enum'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { UserEnvironment } from '../user/user.enum'
import { FilterQuery } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'

export interface ITransactionObject extends baseObjectInterface {
  user: IUser['_id']
  title: TransactionTitle
  object: baseModelInterface
  amount: number
  environment: UserEnvironment
}

// @ts-ignore
export interface ITransaction extends baseModelInterface, ITransactionObject {}

export interface ITransactionService {
  create(
    user: IUserObject,
    title: TransactionTitle,
    object: baseObjectInterface,
    amount: number,
    environment: UserEnvironment
  ): Promise<ITransactionObject>

  fetch(filter: FilterQuery<ITransaction>): Promise<ITransactionObject>

  fetchAll(filter: FilterQuery<ITransaction>): Promise<ITransactionObject[]>

  delete(filter: FilterQuery<ITransaction>): Promise<ITransactionObject>

  count(filter: FilterQuery<ITransaction>): Promise<number>
}
