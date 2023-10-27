import { transactionService } from '../../../setup'
import { transactionA, transactionA_id } from './transaction.payload'

// @ts-ignore
const transactionObj: INotificationObj = {
  ...transactionA,
  // @ts-ignore
  _id: transactionA_id,
}

export const createTransactionMock = jest
  .spyOn(transactionService, 'create')
  .mockResolvedValue(transactionObj)

export const updateTransactionStatusMock = jest
  .spyOn(transactionService, 'updateStatus')
  .mockResolvedValue(transactionObj)

export const updateTransactionAmountMock = jest
  .spyOn(transactionService, 'updateAmount')
  .mockResolvedValue(transactionObj)
