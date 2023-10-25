import TransactionService from '../transaction.service'
import { transactionA, transactionA_id } from './transaction.payload'

// @ts-ignore
const transactionObj: INotificationObj = {
  ...transactionA,
  // @ts-ignore
  _id: transactionA_id,
}

export const createTransactionTransactionMock = jest
  .spyOn(TransactionService.prototype, 'create')
  .mockResolvedValue(transactionObj)

export const updateStatusTransactionTransactionMock = jest
  .spyOn(TransactionService.prototype, 'updateStatus')
  .mockResolvedValue(transactionObj)

export const updateAmountTransactionTransactionMock = jest
  .spyOn(TransactionService.prototype, 'updateAmount')
  .mockResolvedValue(transactionObj)
