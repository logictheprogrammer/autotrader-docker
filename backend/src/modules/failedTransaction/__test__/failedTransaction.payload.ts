import { IFailedTransactionObject } from './../failedTransaction.interface'
import { FailedTransactionStatus } from '../../../modules/failedTransaction/failedTransaction.enum'

export const failedTransactionA = {
  message: 'onFailed message',
  collectionName: 'Deposit',
  status: FailedTransactionStatus.FAILED,
}

// @ts-ignore
export const failedTransactionAObj: IFailedTransactionObject = {
  message: 'onFailed message',
  collectionName: 'Deposit',
  status: FailedTransactionStatus.FAILED,
}
