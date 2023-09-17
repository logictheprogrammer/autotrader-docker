import { FailedTransactionStatus } from '@/modules/failedTransaction/failedTransaction.enum'
import { THttpResponse } from '@/modules/http/http.type'
import { IAppObject } from '@/modules/app/app.interface'
import { Document, ObjectId } from 'mongoose'

export interface IFailedTransactionDoc {
  collectionName: string
  message: string
  status: FailedTransactionStatus
  isDeleted?: boolean
}

export interface IFailedTransactionObject extends IAppObject {
  collectionName: string
  message: string
  status: FailedTransactionStatus
  isDeleted?: boolean
}

export interface IFailedTransaction extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
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
    failedTransactionId: ObjectId
  ): THttpResponse<{ failedTransaction: IFailedTransaction }>

  updateStatus(
    failedTransactionId: ObjectId,
    status: FailedTransactionStatus
  ): THttpResponse<{ failedTransaction: IFailedTransaction }>

  fetch(
    failedTransactionId: ObjectId
  ): THttpResponse<{ failedTransaction: IFailedTransaction }>

  fetchAll(): THttpResponse<{ failedTransactions: IFailedTransaction[] }>
}
