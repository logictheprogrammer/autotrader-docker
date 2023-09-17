import { request } from '../../../test'
import { IFailedTransaction } from '../failedTransaction.interface'
import failedTransactionModel from '../failedTransaction.model'
import { failedTransactionA } from './failedTransaction.payload'

describe('failed transaction', () => {
  request
  describe('create', () => {
    it('should return a failed transaction payload', async () => {
      const result = await failedTransactionModel.create(failedTransactionA)

      const failedTransaction = await failedTransactionModel.findById(
        result._id
      )

      if (!failedTransaction) throw new Error('failedTransaction not saved')

      expect(result.toObject({ getters: true })).toEqual(
        failedTransaction.toObject({ getters: true })
      )
    })
  })
})
