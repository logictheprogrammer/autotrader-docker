import { failedTransactionService } from '../../../setup'
import { request } from '../../../test'
import Helpers from '../../../utils/helpers/helpers'
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

      expect(Helpers.deepClone(result)).toEqual(
        Helpers.deepClone(failedTransaction?.toObject())
      )
    })
  })
})
