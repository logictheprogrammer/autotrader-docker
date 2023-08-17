import { FailedTransactionStatus } from '@/modules/failedTransaction/failedTransaction.enum'
import { THttpResponse } from '@/modules/http/http.type'
import { IAppObject } from '@/modules/app/app.interface'
import AppDocument from '../app/app.document'
import AppObjectId from '../app/app.objectid'

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

export interface IFailedTransaction extends AppDocument {
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
    failedTransactionId: AppObjectId
  ): THttpResponse<{ failedTransaction: IFailedTransaction }>

  updateStatus(
    failedTransactionId: AppObjectId,
    status: FailedTransactionStatus
  ): THttpResponse<{ failedTransaction: IFailedTransaction }>

  fetch(
    failedTransactionId: AppObjectId
  ): THttpResponse<{ failedTransaction: IFailedTransaction }>

  fetchAll(): THttpResponse<{ failedTransactions: IFailedTransaction[] }>
}
