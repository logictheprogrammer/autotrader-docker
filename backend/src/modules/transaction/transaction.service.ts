import { Service } from 'typedi'
import {
  ITransaction,
  ITransactionObject,
  ITransactionService,
} from '@/modules/transaction/transaction.interface'
import { TransactionTitle } from '@/modules/transaction/transaction.enum'
import { IUserObject } from '@/modules/user/user.interface'
import { UserEnvironment } from '../user/user.enum'
import { FilterQuery } from 'mongoose'
import { NotFoundError } from '@/core/apiError'
import baseObjectInterface from '@/core/baseObjectInterface'
import TransactionModel from './transaction.model'

@Service()
class TransactionService implements ITransactionService {
  private transactionModel = TransactionModel

  public async create(
    user: IUserObject,
    title: TransactionTitle,
    object: baseObjectInterface,
    amount: number,
    environment: UserEnvironment
  ): Promise<ITransactionObject> {
    const transaction = await this.transactionModel.create({
      user,
      amount,
      title,
      object,
      environment,
    })

    return transaction.populate('user')
  }

  public async fetch(
    filter: FilterQuery<ITransaction>
  ): Promise<ITransactionObject> {
    const transaction = await this.transactionModel.findOne(filter)

    if (!transaction) throw new NotFoundError('Transaction not found')

    return transaction.populate('user')
  }

  public async fetchAll(
    filter: FilterQuery<ITransaction>
  ): Promise<ITransactionObject[]> {
    const transactions = await this.transactionModel
      .find(filter)
      .sort({ updatedAt: -1 })
      .populate('user')

    return transactions
  }

  public async delete(
    filter: FilterQuery<ITransaction>
  ): Promise<ITransactionObject> {
    const transaction = await this.transactionModel
      .findOne(filter)
      .populate('user')

    if (!transaction) throw new NotFoundError('Transaction not found')

    await transaction.deleteOne()

    return transaction
  }
}

export default TransactionService
