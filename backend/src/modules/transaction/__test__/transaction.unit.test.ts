import { TransactionCategory } from '../../../modules/transaction/transaction.enum'
import { request } from '../../../test'
import { userAInput } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { transactionService } from '../../../setup'
import transactionModel from '../transaction.model'
import { transactionA } from './transaction.payload'
import {
  depositAObj,
  depositA_id,
} from '../../deposit/__test__/deposit.payload'
import { UserEnvironment } from '../../user/user.enum'
import { DepositStatus } from '../../deposit/deposit.enum'
import { InvestmentStatus } from '../../investment/investment.enum'
import { ForecastStatus } from '../../forecast/forecast.enum'
import { Types } from 'mongoose'

describe('transaction', () => {
  describe('create', () => {
    it('should return a transaction instance', async () => {
      request
      const user = await userModel.create(userAInput)
      const amount = 100
      const status = DepositStatus.APPROVED
      const categoryName = TransactionCategory.DEPOSIT
      const environment = UserEnvironment.LIVE

      const transaction = await transactionService.create(
        user,
        status,
        categoryName,
        depositAObj,
        amount,
        environment
      )

      expect(transaction.amount).toBe(amount)
      expect(transaction.status).toEqual(status)
      expect(transaction.categoryName).toBe(categoryName)
      expect(transaction.environment).toBe(environment)

      const savedTransaction = await transactionModel.count(transaction)
      expect(savedTransaction).toBe(1)
    })
  })
  describe('updateStatus', () => {
    describe('given transaction id those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const transaction = await transactionModel.create({
          ...transactionA,
          status: DepositStatus.CANCELLED,
        })

        expect(transaction.status).toBe(DepositStatus.CANCELLED)
        try {
          await transactionService.updateStatus(
            { _id: new Types.ObjectId() },
            DepositStatus.APPROVED
          )
        } catch (error: any) {
          expect(error.error.message).toBe('Transaction not found')
        }
      })
    })
    describe('given transaction was cancelled', () => {
      it('should return a transaction transaction instance with cancelled status', async () => {
        request
        const transaction = await transactionModel.create({
          ...transactionA,
          status: DepositStatus.PENDING,
        })

        expect(transaction.status).toBe(DepositStatus.PENDING)

        const newTransaction = await transactionService.updateStatus(
          { category: transaction.category },
          DepositStatus.CANCELLED
        )

        expect(newTransaction.status).toBe(DepositStatus.CANCELLED)

        const savedTransaction = await transactionModel.count({
          _id: newTransaction._id,
          status: newTransaction.status,
        })
        expect(savedTransaction).toBe(1)
      })
    })
    describe('given transaction was approved', () => {
      it('should return a transaction transaction instance with approved status', async () => {
        request
        const transaction = await transactionModel.create({
          ...transactionA,
          status: DepositStatus.PENDING,
        })

        expect(transaction.status).toBe(DepositStatus.PENDING)

        const transactionObj = await transactionService.updateStatus(
          { category: transaction.category },
          DepositStatus.APPROVED
        )

        expect(transactionObj.status).toBe(DepositStatus.APPROVED)

        const savedTransaction = await transactionModel.count({
          _id: transactionObj._id,
          status: transactionObj.status,
        })
        expect(savedTransaction).toBe(1)
      })
    })
  })
  describe('updateAmount', () => {
    describe('given transaction id those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const transaction = await transactionModel.create({
          ...transactionA,
          status: InvestmentStatus.RUNNING,
        })

        expect(transaction.status).toBe(InvestmentStatus.RUNNING)

        try {
          await transactionService.updateAmount(
            { _id: new Types.ObjectId() },
            ForecastStatus.SETTLED,
            1000
          )
        } catch (error: any) {
          expect(error.error.message).toBe('Transaction not found')
        }
      })
    })
    describe('given transaction was settled', () => {
      it('should return a transaction instance with settled status', async () => {
        request
        const transaction = await transactionModel.create({
          ...transactionA,
          status: InvestmentStatus.RUNNING,
        })

        expect(transaction.status).toBe(InvestmentStatus.RUNNING)

        const transactionObj = await transactionService.updateAmount(
          { category: depositA_id },
          ForecastStatus.SETTLED,
          1000
        )

        expect(transactionObj.status).toBe(ForecastStatus.SETTLED)

        const savedTransaction = await transactionModel.count({
          _id: transactionObj._id,
          status: transactionObj.status,
          amount: transactionObj.amount,
        })
        expect(savedTransaction).toBe(1)
      })
    })
  })
})
