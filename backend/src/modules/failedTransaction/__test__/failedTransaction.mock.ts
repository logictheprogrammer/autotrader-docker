import FailedTransactionService from '../../../modules/failedTransaction/failedTransaction.service'
import { failedTransactionAObj } from './failedTransaction.payload'

export const createFailedTransactionMock = jest
  .spyOn(FailedTransactionService.prototype, 'create')
  .mockResolvedValue(failedTransactionAObj)
