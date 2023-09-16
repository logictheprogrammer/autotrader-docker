import { Service } from 'typedi'
import {
  ITransaction,
  ITransactionObject,
  ITransactionService,
} from '@/modules/transaction/transaction.interface'
import transactionModel from '@/modules/transaction/transaction.model'
import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import formatNumber from '@/utils/formats/formatNumber'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import AppException from '@/modules/app/app.exception'
import HttpException from '@/modules/http/http.exception'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import { IAppObject } from '@/modules/app/app.interface'
import { UserEnvironment } from '../user/user.enum'
import { TransactionStatus } from './transaction.type'
import userModel from '../user/user.model'
import { ObjectId } from 'mongoose'

@Service()
class TransactionService implements ITransactionService {
  private transactionModel = transactionModel
  private userModel = userModel

  private async find(
    transactionId: ObjectId,
    fromAllAccounts: boolean = true,
    userId?: ObjectId
  ): Promise<ITransaction> {
    let transaction
    if (fromAllAccounts) {
      transaction = await this.transactionModel.findById(transactionId)
    } else {
      transaction = await this.transactionModel.findOne({
        _id: transactionId,
        user: userId,
      })
    }

    if (!transaction) throw new HttpException(404, 'Transaction not found')

    return transaction
  }

  private setAmount = async (
    categoryId: ObjectId,
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

    return { transaction: transaction, oldAmount, oldStatus }
  }

  private setStatus = async (
    categoryId: ObjectId,
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

  public async _createTransaction<T extends IAppObject>(
    user: IUserObject,
    status: TransactionStatus,
    categoryName: TransactionCategory,
    categoryObject: T,
    amount: number,
    environment: UserEnvironment,
    stake?: number
  ): TTransaction<ITransactionObject, ITransaction> {
    const transaction = new this.transactionModel({
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
      object: transaction.toObject({ getters: true }),
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
    categoryId: ObjectId,
    status: TransactionStatus,
    amount: number
  ): TTransaction<ITransactionObject, ITransaction> {
    const data = await this.setAmount(categoryId, status, amount)
    const { oldAmount, oldStatus, transaction } = data

    return {
      object: transaction.toObject({ getters: true }),
      instance: {
        model: transaction,
        onFailed: `Set the status of the transaction with an id of (${
          transaction._id
        }) to (${oldStatus}) and the amount to (${formatNumber.toDollar(
          oldAmount
        )})`,
        callback: async () => {
          transaction.status = oldStatus
          transaction.amount = oldAmount
          await transaction.save()
        },
      },
    }
  }

  public async _updateStatusTransaction(
    categoryId: ObjectId,
    status: TransactionStatus
  ): TTransaction<ITransactionObject, ITransaction> {
    const { oldStatus, transaction } = await this.setStatus(categoryId, status)

    return {
      object: transaction.toObject({ getters: true }),
      instance: {
        model: transaction,
        onFailed: `Set the status of the transaction with an id of (${transaction._id}) to (${oldStatus})`,
        callback: async () => {
          await transaction.save()
        },
      },
    }
  }

  public async create<T extends IAppObject>(
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
      throw new AppException(
        err,
        'Failed to register this transaction, please try again'
      )
    }
  }

  public async updateAmount(
    categoryId: ObjectId,
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
      throw new AppException(
        err,
        'Failed to update transaction amount, please try again'
      )
    }
  }

  public async forceUpdateAmount(
    transactionId: ObjectId,
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
      throw new AppException(
        err,
        'Failed to update transaction amount, please try again'
      )
    }
  }

  public async updateStatus(
    categoryId: ObjectId,
    status: TransactionStatus
  ): Promise<ITransactionInstance<ITransaction>> {
    try {
      const { instance } = await this._updateStatusTransaction(
        categoryId,
        status
      )

      return instance
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to update transaction status, please try again'
      )
    }
  }

  public async forceUpdateStatus(
    transactionId: ObjectId,
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
      throw new AppException(
        err,
        'Failed to update this transaction status, please try again'
      )
    }
  }

  public async get(
    transactionId: ObjectId,
    fromAllAccounts: boolean = true,
    userId?: ObjectId
  ): Promise<ITransactionObject> {
    return (await this.find(transactionId, fromAllAccounts, userId)).toObject()
  }

  public fetch = async (
    transactionId: ObjectId,
    userId: ObjectId
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
      throw new AppException(
        err,
        'Failed to fetch transaction, please try again'
      )
    }
  }

  public fetchAll = async (
    all: boolean,
    environment: UserEnvironment,
    userId: ObjectId
  ): THttpResponse<{ transactions: ITransaction[] }> => {
    try {
      let transactions

      if (all) {
        transactions = await this.transactionModel
          .find({ environment })
          .sort({ updatedAt: -1 })
          .select('-userObject -categoryObject -environment')
          .populate('user', 'username isDeleted')
      } else {
        transactions = await this.transactionModel
          .find({ environment, user: userId })
          .sort({ updatedAt: -1 })
          .select('-userObject -categoryObject -environment')
      }

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Transactions fetched successfully',
        data: { transactions },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to fetch transactions, please try again'
      )
    }
  }

  public delete = async (
    transactionId: ObjectId
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
      throw new AppException(
        err,
        'Failed to delete this transaction, please try again'
      )
    }
  }
}

export default TransactionService
