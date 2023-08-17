import formatNumber from '../../../utils/formats/formatNumber'
import { TransactionCategory } from '../../../modules/transaction/transaction.enum'
import { request } from '../../../test'
import { userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { transactionService } from '../../../setup'
import transactionModel from '../transaction.model'
import { transactionA } from './transaction.payload'
import { Types } from 'mongoose'
import {
  depositAObj,
  depositA_id,
} from '../../deposit/__test__/deposit.payload'
import { UserEnvironment } from '../../user/user.enum'
import { DepositStatus } from '../../deposit/deposit.enum'
import { InvestmentStatus } from '../../investment/investment.enum'
import { TradeStatus } from '../../trade/trade.enum'
import AppRepository from '../../app/app.repository'
import { IUser } from '../../user/user.interface'
import { ITransaction } from '../transaction.interface'

const userRepository = new AppRepository<IUser>(userModel)
const transactionRepository = new AppRepository<ITransaction>(transactionModel)

describe('transaction', () => {
  describe('_createTransaction', () => {
    it('should return a transaction instance', async () => {
      request
      const user = await userRepository.create(userA).save()
      const amount = 100
      const status = DepositStatus.APPROVED
      const categoryName = TransactionCategory.DEPOSIT
      const environment = UserEnvironment.LIVE

      const transactionInstance = await transactionService._createTransaction(
        userRepository.toObject(user),
        status,
        categoryName,
        depositAObj,
        amount,
        environment
      )

      expect(transactionInstance.object.amount).toBe(amount)
      expect(transactionInstance.object.status).toEqual(status)
      expect(transactionInstance.object.categoryName).toBe(categoryName)
      expect(transactionInstance.object.environment).toBe(environment)

      expect(transactionInstance.instance.onFailed).toContain(
        `Delete the transaction with an id of (${
          transactionInstance.instance.model.collectUnsaved()._id
        })`
      )
    })
  })
  describe('_updateStatusTransaction', () => {
    describe('given transaction id those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const transaction = await transactionRepository
          .create({
            ...transactionA,
            status: DepositStatus.CANCELLED,
          })
          .save()

        expect(transaction.status).toBe(DepositStatus.CANCELLED)

        await expect(
          transactionService._updateStatusTransaction(
            new Types.ObjectId(),
            DepositStatus.APPROVED
          )
        ).rejects.toThrow('Transaction not found')
      })
    })
    describe('given transaction was cancelled', () => {
      it('should return a transaction transaction instance with cancelled status', async () => {
        request
        const transaction = await transactionRepository
          .create({
            ...transactionA,
            status: DepositStatus.PENDING,
          })
          .save()

        expect(transaction.status).toBe(DepositStatus.PENDING)

        const transactionInstance =
          await transactionService._updateStatusTransaction(
            transaction.category,
            DepositStatus.CANCELLED
          )

        expect(transactionInstance.object.status).toBe(DepositStatus.CANCELLED)

        expect(transactionInstance.instance.onFailed).toContain(
          `Set the status of the transaction with an id of (${
            transactionInstance.instance.model.collectUnsaved()._id
          }) to (${DepositStatus.PENDING})`
        )
      })
    })
    describe('given transaction was approved', () => {
      it('should return a transaction transaction instance with approved status', async () => {
        request
        const transaction = await transactionRepository
          .create({
            ...transactionA,
            status: DepositStatus.PENDING,
          })
          .save()

        expect(transaction.status).toBe(DepositStatus.PENDING)

        const transactionInstance =
          await transactionService._updateStatusTransaction(
            transaction.category,
            DepositStatus.APPROVED
          )

        expect(transactionInstance.object.status).toBe(DepositStatus.APPROVED)

        expect(transactionInstance.instance.onFailed).toContain(
          `Set the status of the transaction with an id of (${
            transactionInstance.instance.model.collectUnsaved()._id
          }) to (${DepositStatus.PENDING})`
        )
      })
    })
  })
  describe('_updateAmountTransaction', () => {
    describe('given transaction id those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const transaction = await transactionRepository
          .create({
            ...transactionA,
            status: InvestmentStatus.RUNNING,
          })
          .save()

        expect(transaction.status).toBe(InvestmentStatus.RUNNING)

        await expect(
          transactionService._updateAmountTransaction(
            new Types.ObjectId(),
            TradeStatus.SETTLED,
            1000
          )
        ).rejects.toThrow('Transaction not found')
      })
    })
    describe('given transaction was settled', () => {
      it('should return a transaction instance with settled status', async () => {
        request
        const transaction = await transactionRepository
          .create({
            ...transactionA,
            status: InvestmentStatus.RUNNING,
          })
          .save()

        expect(transaction.status).toBe(InvestmentStatus.RUNNING)

        const transactionInstance =
          await transactionService._updateAmountTransaction(
            depositA_id,
            TradeStatus.SETTLED,
            1000
          )

        expect(transactionInstance.object.status).toBe(TradeStatus.SETTLED)

        expect(transactionInstance.instance.onFailed).toContain(
          `Set the status of the transaction with an id of (${
            transactionInstance.instance.model.collectUnsaved()._id
          }) to (${
            InvestmentStatus.RUNNING
          }) and the amount to (${formatNumber.toDollar(transactionA.amount)})`
        )
      })
    })
  })
})
