import { WithdrawalStatus } from '../../../modules/withdrawal/withdrawal.enum'
import { withdrawalMethodA } from './../../withdrawalMethod/__test__/withdrawalMethod.payload'
import { request } from '../../../test'
import { userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import withdrawalMethodModel from '../../withdrawalMethod/withdrawalMethod.model'
import { withdrawalService } from '../../../setup'
import withdrawalModel from '../withdrawal.model'
import { withdrawalA } from './withdrawal.payload'
import { UserAccount } from '../../user/user.enum'
import AppRepository from '../../app/app.repository'
import { IWithdrawal } from '../withdrawal.interface'
import { IWithdrawalMethod } from '../../withdrawalMethod/withdrawalMethod.interface'
import { IUser } from '../../user/user.interface'
import AppObjectId from '../../app/app.objectId'

const userRepository = new AppRepository<IUser>(userModel)
const withdrawalRepository = new AppRepository<IWithdrawal>(withdrawalModel)
const withdrawalMethodRepository = new AppRepository<IWithdrawalMethod>(
  withdrawalMethodModel
)

describe('withdrawal', () => {
  describe('_createTransaction', () => {
    it('should return a withdrawal transaction instance', async () => {
      request
      const user = await userRepository.create(userA).save()
      const withdrawalMethod = await withdrawalMethodRepository
        .create(withdrawalMethodA)
        .save()
      const amount = 100
      const address = 'address'

      const withdrawalInstance = await withdrawalService._createTransaction(
        withdrawalMethod.toObject(),
        user.toObject(),
        UserAccount.MAIN_BALANCE,
        address,
        amount
      )

      expect(withdrawalInstance.object.amount).toBe(amount)
      expect(withdrawalInstance.object.withdrawalMethod).toEqual(
        withdrawalMethod._id
      )
      expect(withdrawalInstance.object.fee).toBe(withdrawalMethod.fee)
      expect(withdrawalInstance.object.status).toBe(WithdrawalStatus.PENDING)
      expect(withdrawalInstance.object.user).toEqual(user._id)
      // @ts-ignore
      expect(
        withdrawalInstance.instance.model.collectUnsaved().withdrawalMethod
      ).toEqual(withdrawalMethod._id)
      expect(withdrawalInstance.instance.onFailed).toContain(
        `Delete the withdrawal with an id of (${
          withdrawalInstance.instance.model.collectUnsaved()._id
        })`
      )
    })
  })
  describe('_updateStatusTransaction', () => {
    describe('given withdrawal id those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const withdrawal = await withdrawalRepository
          .create({
            ...withdrawalA,
            status: WithdrawalStatus.CANCELLED,
          })
          .save()

        expect(withdrawal.status).toBe(WithdrawalStatus.CANCELLED)

        await expect(
          withdrawalService._updateStatusTransaction(
            new AppObjectId(),
            WithdrawalStatus.APPROVED
          )
        ).rejects.toThrow('Withdrawal transaction not found')
      })
    })
    describe('given the status has already been settle', () => {
      it('should throw a 400 error', async () => {
        request
        const withdrawal = await withdrawalRepository
          .create({
            ...withdrawalA,
            status: WithdrawalStatus.CANCELLED,
          })
          .save()

        expect(withdrawal.status).toBe(WithdrawalStatus.CANCELLED)

        await expect(
          withdrawalService._updateStatusTransaction(
            withdrawal._id,
            WithdrawalStatus.APPROVED
          )
        ).rejects.toThrow('Withdrawal as already been settled')
      })
    })
    describe('given withdrawal was cancelled', () => {
      it('should return a withdrawal transaction instance with cancelled status', async () => {
        request
        const withdrawal = await withdrawalRepository.create(withdrawalA).save()

        expect(withdrawal.status).toBe(WithdrawalStatus.PENDING)

        const withdrawalInstance =
          await withdrawalService._updateStatusTransaction(
            withdrawal._id,
            WithdrawalStatus.CANCELLED
          )

        expect(withdrawalInstance.object.status).toBe(
          WithdrawalStatus.CANCELLED
        )

        expect(withdrawalInstance.instance.onFailed).toContain(
          `Set the status of the withdrawal with an id of (${
            withdrawalInstance.instance.model.collectUnsaved()._id
          }) to (${WithdrawalStatus.PENDING})`
        )
      })
    })
    describe('given withdrawal was approved', () => {
      it('should return a withdrawal transaction instance with approved status', async () => {
        request
        const withdrawal = await withdrawalRepository.create(withdrawalA).save()

        expect(withdrawal.status).toBe(WithdrawalStatus.PENDING)

        const withdrawalInstance =
          await withdrawalService._updateStatusTransaction(
            withdrawal._id,
            WithdrawalStatus.APPROVED
          )

        expect(withdrawalInstance.object.status).toBe(WithdrawalStatus.APPROVED)

        expect(withdrawalInstance.instance.onFailed).toContain(
          `Set the status of the withdrawal with an id of (${
            withdrawalInstance.instance.model.collectUnsaved()._id
          }) to (${WithdrawalStatus.PENDING})`
        )
      })
    })
  })
})
