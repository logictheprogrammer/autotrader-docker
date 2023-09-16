import { Service } from 'typedi'
import { FailedTransactionStatus } from '@/modules/failedTransaction/failedTransaction.enum'
import {
  IFailedTransaction,
  IFailedTransactionObject,
  IFailedTransactionService,
} from '@/modules/failedTransaction/failedTransaction.interface'
import failedTransactionModel from '@/modules/failedTransaction/failedTransaction.model'
import AppException from '@/modules/app/app.exception'
import HttpException from '@/modules/http/http.exception'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import { ObjectId } from 'mongoose'

@Service()
class FailedTransactionService implements IFailedTransactionService {
  private failedTransactionModel = failedTransactionModel

  private find = async (
    failedTransactionId: ObjectId,
    fromAllAccounts: boolean = true,
    userId?: string
  ): Promise<IFailedTransaction> => {
    let failedTransaction

    if (fromAllAccounts) {
      failedTransaction = await this.failedTransactionModel.findById(
        failedTransactionId
      )
    } else {
      failedTransaction = await this.failedTransactionModel.findOne({
        _id: failedTransactionId,
        user: userId,
      })
    }

    if (!failedTransaction)
      throw new HttpException(404, 'Failed transaction not found')

    return failedTransaction
  }

  public async create(
    message: string,
    collectionName: string,
    status: FailedTransactionStatus
  ): Promise<IFailedTransactionObject> {
    try {
      const failedTransaction = await this.failedTransactionModel.create({
        message,
        collectionName,
        status,
      })

      return failedTransaction.toObject({ getters: true })
    } catch (err: any) {
      throw new AppException(
        err,
        'Unable to register failed transaction, please try again'
      )
    }
  }

  public async updateStatus(
    failedTransactionId: ObjectId,
    status: FailedTransactionStatus
  ): THttpResponse<{ failedTransaction: IFailedTransaction }> {
    try {
      const failedTransaction = await this.find(failedTransactionId)

      failedTransaction.status = status

      await failedTransaction.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Failed transaction status updated successfully',
        data: { failedTransaction },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Unable to update Failed Transaction status, please try again'
      )
    }
  }

  public async delete(
    failedTransactionId: ObjectId
  ): THttpResponse<{ failedTransaction: IFailedTransaction }> {
    try {
      const failedTransaction = await this.find(failedTransactionId)

      await this.failedTransactionModel.deleteOne({
        _id: failedTransaction._id,
      })

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Failed transaction deleted successfully',
        data: {
          failedTransaction: failedTransaction,
        },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Unable to delete Failed Transaction, please try again'
      )
    }
  }

  public async fetch(
    failedTransactionId: ObjectId
  ): THttpResponse<{ failedTransaction: IFailedTransaction }> {
    try {
      const failedTransaction = await this.find(failedTransactionId)

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Failed transaction fetched successfully',
        data: {
          failedTransaction: failedTransaction,
        },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Unable to fetch Failed Transaction, please try again'
      )
    }
  }

  public fetchAll = async (): THttpResponse<{
    failedTransactions: IFailedTransaction[]
  }> => {
    try {
      const failedTransactions = await this.failedTransactionModel.find()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Failed transactions fetched successfully',
        data: { failedTransactions },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Unable to fetch Failed Transactions, please try again'
      )
    }
  }
}

export default FailedTransactionService
