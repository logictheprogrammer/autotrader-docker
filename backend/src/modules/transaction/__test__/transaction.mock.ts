import transactionModel from '../../../modules/transaction/transaction.model'
import { ITransaction } from '../transaction.interface'
import TransactionService from '../transaction.service'
import {
  transactionA,
  transactionA_id,
  transactionModelReturn,
} from './transaction.payload'

// @ts-ignore
const transactionObj: INotificationObj = {
  ...transactionA,
  // @ts-ignore
  _id: transactionA_id,
}

export const createTransactionTransactionMock = jest
  .spyOn(TransactionService.prototype, '_createTransaction')
  .mockResolvedValue({
    object: transactionObj,
    instance: {
      model: transactionModelReturn,
      onFailed: 'delete transaction',
      async callback() {},
    },
  })

export const updateStatusTransactionTransactionMock = jest
  .spyOn(TransactionService.prototype, '_updateStatusTransaction')
  .mockResolvedValue({
    object: transactionObj,
    instance: {
      model: transactionModelReturn,
      onFailed: 'change transaction status to old status',
      async callback() {},
    },
  })

export const updateAmountTransactionTransactionMock = jest
  .spyOn(TransactionService.prototype, '_updateAmountTransaction')
  .mockResolvedValue({
    object: transactionObj,
    instance: {
      model: transactionModelReturn,
      onFailed: 'change transaction amount to old amount',
      async callback() {},
    },
  })
