import { Types } from 'mongoose'
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
import AppRepository from '../app/app.repository'

@Service()
class FailedTransactionService implements IFailedTransactionService {
  private failedTransactionRepository = new AppRepository<IFailedTransaction>(
    failedTransactionModel
  )

  private find = async (
    failedTransactionId: Types.ObjectId,
    fromAllAccounts: boolean = true,
    userId?: string
  ): Promise<IFailedTransaction> => {
    const failedTransaction = await this.failedTransactionRepository
      .findById(failedTransactionId, fromAllAccounts, userId)
      .collect()

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
      const failedTransaction = await this.failedTransactionRepository
        .create({
          message,
          collectionName,
          status,
        })
        .save()

      return this.failedTransactionRepository.toObject(failedTransaction)
    } catch (err: any) {
      throw new AppException(
        err,
        'Unable to register failed transaction, please try again'
      )
    }
  }

  public async updateStatus(
    failedTransactionId: Types.ObjectId,
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
    failedTransactionId: Types.ObjectId
  ): THttpResponse<{ failedTransaction: IFailedTransaction }> {
    try {
      const failedTransaction = await this.find(failedTransactionId)

      await this.failedTransactionRepository.deleteOne({
        _id: failedTransaction._id,
      })

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Failed transaction deleted successfully',
        data: {
          failedTransaction:
            this.failedTransactionRepository.toObject(failedTransaction),
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
    failedTransactionId: Types.ObjectId
  ): THttpResponse<{ failedTransaction: IFailedTransaction }> {
    try {
      const failedTransaction = await this.find(failedTransactionId)

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Failed transaction fetched successfully',
        data: {
          failedTransaction:
            this.failedTransactionRepository.toObject(failedTransaction),
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
      const failedTransactions = await this.failedTransactionRepository
        .find()
        .collectAll()

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
