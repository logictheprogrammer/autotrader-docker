import { TransactionTitle } from '../../../modules/transaction/transaction.enum'
import { request } from '../../../test'
import { userAInput } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { transactionService } from '../../../setup'
import transactionModel from '../transaction.model'
import { depositAObj } from '../../deposit/__test__/deposit.payload'
import { UserEnvironment } from '../../user/user.enum'
import Helpers from '../../../utils/helpers'

describe('transaction', () => {
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(transactionService)
      expect(methods).toEqual([
        'transactionModel',
        'create',
        'fetch',
        'fetchAll',
        'delete',
        'count',
      ])
    })
  })
  describe('create', () => {
    it('should return a transaction instance', async () => {
      request
      const user = await userModel.create(userAInput)
      const amount = 100
      const title = TransactionTitle.DEPOSIT_SUCCESSFUL
      const environment = UserEnvironment.LIVE

      const transaction = await transactionService.create(
        user,
        title,
        depositAObj,
        amount,
        environment
      )

      expect(transaction.amount).toBe(amount)
      expect(transaction.title).toBe(title)
      expect(transaction.environment).toBe(environment)

      const savedTransaction = await transactionModel.count(transaction)
      expect(savedTransaction).toBe(1)
    })
  })
})
