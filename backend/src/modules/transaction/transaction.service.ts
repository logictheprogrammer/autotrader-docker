import { Service } from 'typedi'
import {
  ITransaction,
  ITransactionObject,
  ITransactionService,
} from '@/modules/transaction/transaction.interface'
import transactionModel from '@/modules/transaction/transaction.model'
import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import { IUserObject } from '@/modules/user/user.interface'
import formatNumber from '@/utils/formats/formatNumber'
import { Types } from 'mongoose'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import ServiceQuery from '@/modules/service/service.query'
import ServiceException from '@/modules/service/service.exception'
import HttpException from '@/modules/http/http.exception'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import { IServiceObject } from '@/modules/service/service.interface'
import { UserEnvironment } from '../user/user.enum'
import { TransactionStatus } from './transaction.type'

@Service()
class TransactionService implements ITransactionService {
  private transactionModel = new ServiceQuery<ITransaction>(transactionModel)

  private async find(
    transactionId: Types.ObjectId,
    fromAllAccounts: boolean = true,
    userId?: Types.ObjectId
  ): Promise<ITransaction> {
    const transaction = await this.transactionModel.findById(
      transactionId,
      fromAllAccounts,
      userId
    )

    if (!transaction) throw new HttpException(404, 'Transaction not found')

    return transaction
  }

  private setAmount = async (
    categoryId: Types.ObjectId,
    status: TransactionStatus,
    amount: number
  ): Promise<{
    transaction: ITransaction
    oldStatus: TransactionStatus
    oldAmount: number
  }> => {
    const transaction = await this.transactionModel.findOne({
      category: categoryId,
    })

    if (!transaction) throw new HttpException(404, 'Transaction not found')

    const oldStatus = transaction.status
    const oldAmount = transaction.amount

    transaction.status = status
    transaction.amount = amount

    return { transaction, oldAmount, oldStatus }
  }

  private setStatus = async (
    categoryId: Types.ObjectId,
    status: TransactionStatus
  ): Promise<{
    transaction: ITransaction
    oldStatus: TransactionStatus
  }> => {
    const transaction = await this.transactionModel.findOne({
      category: categoryId,
    })

    if (!transaction) throw new HttpException(404, 'Transaction not found')

    const oldStatus = transaction.status

    transaction.status = status

    return { transaction, oldStatus }
  }

  public async _createTransaction<T extends IServiceObject>(
    user: IUserObject,
    status: TransactionStatus,
    categoryName: TransactionCategory,
    categoryObject: T,
    amount: number,
    environment: UserEnvironment,
    stake?: number
  ): TTransaction<ITransactionObject, ITransaction> {
    const transaction = new this.transactionModel.self({
      user: user._id,
      userObject: user,
      amount,
      status,
      categoryName,
      category: categoryObject._id,
      categoryObject,
      stake,
      environment,
    })

    return {
      object: transaction.toObject(),
      instance: {
        model: transaction,
        onFailed: `Delete the transaction with an id of (${transaction._id})`,
        async callback() {
          await transaction.deleteOne()
        },
      },
    }
  }

  public async _updateAmountTransaction(
    categoryId: Types.ObjectId,
    status: TransactionStatus,
    amount: number
  ): TTransaction<ITransactionObject, ITransaction> {
    const data = await this.setAmount(categoryId, status, amount)
    const { oldAmount, oldStatus, transaction } = data

    return {
      object: transaction.toObject(),
      instance: {
        model: transaction,
        onFailed: `Set the status of the transaction with an id of (${
          transaction._id
        }) to (${oldStatus}) and the amount to (${formatNumber.toDollar(
          oldAmount
        )})`,
        async callback() {
          transaction.status = oldStatus
          transaction.amount = oldAmount
          await transaction.save()
        },
      },
    }
  }

  public async _updateStatusTransaction(
    categoryId: Types.ObjectId,
    status: TransactionStatus
  ): TTransaction<ITransactionObject, ITransaction> {
    const { oldStatus, transaction } = await this.setStatus(categoryId, status)

    return {
      object: transaction.toObject(),
      instance: {
        model: transaction,
        onFailed: `Set the status of the transaction with an id of (${transaction._id}) to (${oldStatus})`,
        async callback() {
          await transaction.save()
        },
      },
    }
  }

  public async create<T extends IServiceObject>(
    user: IUserObject,
    status: TransactionStatus,
    categoryName: TransactionCategory,
    categoryObject: T,
    amount: number,
    environment: UserEnvironment,
    stake?: number
  ): Promise<ITransactionInstance<ITransaction>> {
    try {
      const { instance } = await this._createTransaction(
        user,
        status,
        categoryName,
        categoryObject,
        amount,
        environment,
        stake
      )

      return instance
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to register this transaction, please try again'
      )
    }
  }

  public async updateAmount(
    categoryId: Types.ObjectId,
    status: TransactionStatus,
    amount: number
  ): Promise<ITransactionInstance<ITransaction>> {
    try {
      const { instance } = await this._updateAmountTransaction(
        categoryId,
        status,
        amount
      )

      return instance
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to update transaction amount, please try again'
      )
    }
  }

  public async forceUpdateAmount(
    transactionId: Types.ObjectId,
    status: TransactionStatus,
    amount: number
  ): THttpResponse<{ transaction: ITransaction }> {
    try {
      const transaction = await this.find(transactionId)

      transaction.status = status
      transaction.amount = amount

      await transaction.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Transaction amount updated successfully',
        data: { transaction },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to update transaction amount, please try again'
      )
    }
  }

  public async updateStatus(
    categoryId: Types.ObjectId,
    status: TransactionStatus
  ): Promise<ITransactionInstance<ITransaction>> {
    try {
      const { instance } = await this._updateStatusTransaction(
        categoryId,
        status
      )

      return instance
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to update transaction status, please try again'
      )
    }
  }

  public async forceUpdateStatus(
    transactionId: Types.ObjectId,
    status: TransactionStatus
  ): THttpResponse<{ transaction: ITransaction }> {
    try {
      const transaction = await this.find(transactionId)

      transaction.status = status

      await transaction.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Transaction status updated successfully',
        data: { transaction },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to update this transaction status, please try again'
      )
    }
  }

  public async get(
    transactionId: Types.ObjectId,
    fromAllAccounts: boolean = true,
    userId?: Types.ObjectId
  ): Promise<ITransactionObject> {
    return (await this.find(transactionId, fromAllAccounts, userId)).toObject()
  }

  public fetch = async (
    transactionId: Types.ObjectId,
    userId: Types.ObjectId
  ): THttpResponse<{ transaction: ITransaction }> => {
    try {
      const transaction = await this.transactionModel.findOne({
        _id: transactionId,
        user: userId,
      })

      if (!transaction) throw new HttpException(404, 'Transaction not found')

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Transaction fetched successfully',
        data: { transaction },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to fetch transaction, please try again'
      )
    }
  }

  public fetchAll = async (
    all: boolean,
    environment: UserEnvironment,
    userId: Types.ObjectId
  ): THttpResponse<{ transactions: ITransaction[] }> => {
    try {
      let transactions = await this.transactionModel
        .find({ environment }, all, {
          user: userId,
        })
        .select('-userObject -category')

      await this.transactionModel.populate(
        transactions,
        'user',
        'userObject',
        'username isDeleted'
      )

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Transactions fetched successfully',
        data: { transactions },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to fetch transactions, please try again'
      )
    }
  }

  public delete = async (
    transactionId: Types.ObjectId
  ): THttpResponse<{ transaction: ITransaction }> => {
    try {
      const transaction = await this.find(transactionId)

      await transaction.deleteOne()
      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Transaction deleted successfully',
        data: { transaction },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to delete this transaction, please try again'
      )
    }
  }
}

export default TransactionService
