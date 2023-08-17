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
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import AppException from '@/modules/app/app.exception'
import HttpException from '@/modules/http/http.exception'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import { IAppObject } from '@/modules/app/app.interface'
import { UserEnvironment } from '../user/user.enum'
import { TransactionStatus } from './transaction.type'
import AppRepository from '../app/app.repository'
import AppObjectId from '../app/app.objectId'

@Service()
class TransactionService implements ITransactionService {
  private transactionRepository = new AppRepository<ITransaction>(
    transactionModel
  )

  private async find(
    transactionId: AppObjectId,
    fromAllAccounts: boolean = true,
    userId?: AppObjectId
  ): Promise<ITransaction> {
    const transaction = await this.transactionRepository
      .findById(transactionId, fromAllAccounts, userId)
      .collect()

    if (!transaction) throw new HttpException(404, 'Transaction not found')

    return transaction
  }

  private setAmount = async (
    categoryId: AppObjectId,
    status: TransactionStatus,
    amount: number
  ): Promise<{
    transaction: AppRepository<ITransaction>
    oldStatus: TransactionStatus
    oldAmount: number
  }> => {
    const transaction = await this.transactionRepository
      .findOne({
        category: categoryId,
      })
      .collect()

    if (!transaction) throw new HttpException(404, 'Transaction not found')

    const oldStatus = transaction.status
    const oldAmount = transaction.amount

    transaction.status = status
    transaction.amount = amount

    const newTransaction = this.transactionRepository.toClass(transaction)

    return { transaction: newTransaction, oldAmount, oldStatus }
  }

  private setStatus = async (
    categoryId: AppObjectId,
    status: TransactionStatus
  ): Promise<{
    transaction: AppRepository<ITransaction>
    oldStatus: TransactionStatus
  }> => {
    const transaction = await this.transactionRepository
      .findOne({
        category: categoryId,
      })
      .collect()

    if (!transaction) throw new HttpException(404, 'Transaction not found')

    const oldStatus = transaction.status

    transaction.status = status

    const newTransaction = this.transactionRepository.toClass(transaction)

    return { transaction: newTransaction, oldStatus }
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
    const transaction = this.transactionRepository.create({
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

    const unsavedTransaction = transaction.collectUnsaved()

    return {
      object: unsavedTransaction,
      instance: {
        model: transaction,
        onFailed: `Delete the transaction with an id of (${unsavedTransaction._id})`,
        async callback() {
          await transaction.deleteOne()
        },
      },
    }
  }

  public async _updateAmountTransaction(
    categoryId: AppObjectId,
    status: TransactionStatus,
    amount: number
  ): TTransaction<ITransactionObject, ITransaction> {
    const data = await this.setAmount(categoryId, status, amount)
    const { oldAmount, oldStatus, transaction } = data

    const unsavedTransaction = transaction.collectUnsaved()

    return {
      object: unsavedTransaction,
      instance: {
        model: transaction,
        onFailed: `Set the status of the transaction with an id of (${
          unsavedTransaction._id
        }) to (${oldStatus}) and the amount to (${formatNumber.toDollar(
          oldAmount
        )})`,
        callback: async () => {
          unsavedTransaction.status = oldStatus
          unsavedTransaction.amount = oldAmount
          await this.transactionRepository.save(unsavedTransaction)
        },
      },
    }
  }

  public async _updateStatusTransaction(
    categoryId: AppObjectId,
    status: TransactionStatus
  ): TTransaction<ITransactionObject, ITransaction> {
    const { oldStatus, transaction } = await this.setStatus(categoryId, status)

    const unsavedTransaction = transaction.collectUnsaved()
    return {
      object: unsavedTransaction,
      instance: {
        model: transaction,
        onFailed: `Set the status of the transaction with an id of (${unsavedTransaction._id}) to (${oldStatus})`,
        callback: async () => {
          await this.transactionRepository.save(unsavedTransaction)
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
    categoryId: AppObjectId,
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
    transactionId: AppObjectId,
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
    categoryId: AppObjectId,
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
    transactionId: AppObjectId,
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
    transactionId: AppObjectId,
    fromAllAccounts: boolean = true,
    userId?: AppObjectId
  ): Promise<ITransactionObject> {
    return (await this.find(transactionId, fromAllAccounts, userId)).toObject()
  }

  public fetch = async (
    transactionId: AppObjectId,
    userId: AppObjectId
  ): THttpResponse<{ transaction: ITransaction }> => {
    try {
      const transaction = await this.transactionRepository
        .findOne({
          _id: transactionId,
          user: userId,
        })
        .collect()

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
    userId: AppObjectId
  ): THttpResponse<{ transactions: ITransaction[] }> => {
    try {
      let transactions = await this.transactionRepository
        .find({ environment }, all, {
          user: userId,
        })
        .select('-userObject -category')
        .collectAll()

      await this.transactionRepository.populate(
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
      throw new AppException(
        err,
        'Failed to fetch transactions, please try again'
      )
    }
  }

  public delete = async (
    transactionId: AppObjectId
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
