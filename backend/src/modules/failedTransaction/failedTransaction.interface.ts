import { Document, Types } from 'mongoose'
import { FailedTransactionStatus } from '@/modules/failedTransaction/failedTransaction.enum'
import { THttpResponse } from '@/modules/http/http.type'
import { IServiceObject } from '@/modules/service/service.interface'

export interface IFailedTransactionDoc {
  collectionName: string
  message: string
  status: FailedTransactionStatus
  isDeleted?: boolean
}

export interface IFailedTransactionObject extends IServiceObject {
  collectionName: string
  message: string
  status: FailedTransactionStatus
  isDeleted?: boolean
}

export interface IFailedTransaction extends Document {
  collectionName: string
  message: string
  status: FailedTransactionStatus
  isDeleted?: boolean
}

export interface IFailedTransactionService {
  create(
    message: string,
    collectionName: string,
    status: FailedTransactionStatus
  ): Promise<IFailedTransactionObject>

  delete(
    failedTransactionId: Types.ObjectId
  ): THttpResponse<{ failedTransaction: IFailedTransaction }>

  updateStatus(
    failedTransactionId: Types.ObjectId,
    status: FailedTransactionStatus
  ): THttpResponse<{ failedTransaction: IFailedTransaction }>

  fetch(
    failedTransactionId: Types.ObjectId
  ): THttpResponse<{ failedTransaction: IFailedTransaction }>

  fetchAll(): THttpResponse<{ failedTransactions: IFailedTransaction[] }>
}
