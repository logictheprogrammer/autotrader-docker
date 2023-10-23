import { Service } from 'typedi'
import {
  ITransaction,
  ITransactionObject,
  ITransactionService,
} from '@/modules/transaction/transaction.interface'
import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import { IUserObject } from '@/modules/user/user.interface'
import { UserEnvironment } from '../user/user.enum'
import { TransactionStatus } from './transaction.type'
import { FilterQuery } from 'mongoose'
import { NotFoundError, ServiceError } from '@/core/apiError'
import baseObjectInterface from '@/core/baseObjectInterface'
import TransactionModel from './transaction.model'

@Service()
class TransactionService implements ITransactionService {
  private transactionModel = TransactionModel

  public async create(
    user: IUserObject,
    status: TransactionStatus,
    categoryName: TransactionCategory,
    category: baseObjectInterface,
    amount: number,
    environment: UserEnvironment,
    stake?: number
  ): Promise<ITransactionObject> {
    try {
      const transaction = await this.transactionModel.create({
        user,
        amount,
        status,
        categoryName,
        category,
        stake,
        environment,
      })

      return transaction.populate('user')
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to register this transaction, please try again'
      )
    }
  }

  public async updateAmount(
    filter: FilterQuery<ITransaction>,
    status: TransactionStatus,
    amount: number
  ): Promise<ITransactionObject> {
    try {
      const transaction = await this.transactionModel.findOne(filter)

      if (!transaction) throw new NotFoundError('Transaction not found')

      transaction.status = status
      transaction.amount = amount

      await transaction.save()

      return transaction.populate('user')
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to update transaction amount, please try again'
      )
    }
  }

  public async updateStatus(
    filter: FilterQuery<ITransaction>,
    status: TransactionStatus
  ): Promise<ITransactionObject> {
    try {
      const transaction = await this.transactionModel.findOne(filter)

      if (!transaction) throw new NotFoundError('Transaction not found')

      transaction.status = status

      await transaction.save()

      return transaction.populate('user')
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to update transaction status, please try again'
      )
    }
  }

  public async fetch(
    filter: FilterQuery<ITransaction>
  ): Promise<ITransactionObject> {
    try {
      const transaction = await this.transactionModel.findOne(filter)

      if (!transaction) throw new NotFoundError('Transaction not found')

      return transaction.populate('user')
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to fetch transaction, please try again'
      )
    }
  }

  public async fetchAll(
    filter: FilterQuery<ITransaction>
  ): Promise<ITransactionObject[]> {
    try {
      const transactions = await this.transactionModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .populate('user')

      return transactions
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to fetch transactions, please try again'
      )
    }
  }

  public async delete(
    filter: FilterQuery<ITransaction>
  ): Promise<ITransactionObject> {
    try {
      const transaction = await this.transactionModel
        .findOne(filter)
        .populate('user')

      if (!transaction) throw new NotFoundError('Transaction not found')

      await transaction.deleteOne()

      return transaction
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to delete this transaction, please try again'
      )
    }
  }
}

export default TransactionService
