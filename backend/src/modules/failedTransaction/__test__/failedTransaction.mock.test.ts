import { failedTransactionService } from '../../../setup'
import { request } from '../../../test'
import Helpers from '../../../utils/helpers/helpers'
import AppRepository from '../../app/app.repository'
import { IFailedTransaction } from '../failedTransaction.interface'
import failedTransactionModel from '../failedTransaction.model'
import { failedTransactionA } from './failedTransaction.payload'

const failedTransactionRepository = new AppRepository<IFailedTransaction>(
  failedTransactionModel
)

describe('failed transaction', () => {
  request
  describe('create', () => {
    it('should return a failed transaction payload', async () => {
      const result = await failedTransactionRepository
        .create(failedTransactionA)
        .save()

      const failedTransaction = await failedTransactionRepository
        .findById(result._id)
        .collect()

      if (!failedTransaction) throw new Error('failedTransaction not saved')

      expect(failedTransactionRepository.toObject(result)).toEqual(
        failedTransactionRepository.toObject(failedTransaction)
      )
    })
  })
})
