import { IDepositMethod } from './../../depositMethod/depositMethod.interface'
import { DepositStatus } from '../../../modules/deposit/deposit.enum'
import { depositMethodA } from './../../depositMethod/__test__/depositMethod.payload'
import depositMethodModel from '../../depositMethod/depositMethod.model'
import { request } from '../../../test'
import { userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { depositService } from '../../../setup'
import depositModel from '../deposit.model'
import { depositA } from './deposit.payload'
import { IDeposit } from '../deposit.interface'
import { IUser } from '../../user/user.interface'
import { Types } from 'mongoose'

describe('deposit', () => {
  describe('_createTransaction', () => {
    it('should return a deposit transaction instance', async () => {
      request
      const user = await userModel.create(userA)
      const depositMethod = await depositMethodModel.create(depositMethodA)

      const userObj = user.toObject({ getters: true })
      const depositMethodObj = depositMethod.toObject({ getters: true })
      const amount = 100

      const depositInstance = await depositService._createTransaction(
        userObj,
        depositMethodObj,
        amount
      )

      expect(depositInstance.object.amount).toBe(amount)
      expect(depositInstance.object.depositMethod).toEqual(depositMethodObj._id)
      expect(depositInstance.object.fee).toBe(depositMethodObj.fee)
      expect(depositInstance.object.status).toBe(DepositStatus.PENDING)
      expect(depositInstance.object.user).toEqual(userObj._id)
      // @ts-ignore
      expect(depositInstance.instance.model.depositMethod).toEqual(
        depositMethodObj._id
      )
      expect(depositInstance.instance.onFailed).toContain(
        `Delete the deposit with an id of (${depositInstance.instance.model._id})`
      )
    })
  })
  describe('_updateStatusTransaction', () => {
    describe('given deposit id those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const deposit = await depositModel.create({
          ...depositA,
          status: DepositStatus.CANCELLED,
        })

        expect(deposit.status).toBe(DepositStatus.CANCELLED)

        await expect(
          depositService._updateStatusTransaction(
            new Types.ObjectId(),
            DepositStatus.APPROVED
          )
        ).rejects.toThrow('Deposit transaction not found')
      })
    })
    describe('given the status has already been settle', () => {
      it('should throw a 400 error', async () => {
        request
        const deposit = await depositModel.create({
          ...depositA,
          status: DepositStatus.CANCELLED,
        })

        expect(deposit.status).toBe(DepositStatus.CANCELLED)

        await expect(
          depositService._updateStatusTransaction(
            deposit._id,
            DepositStatus.APPROVED
          )
        ).rejects.toThrow('Deposit as already been settled')
      })
    })
    describe('given deposit was cancelled', () => {
      it('should return a deposit transaction instance with cancelled status', async () => {
        request
        const deposit = await depositModel.create(depositA)

        expect(deposit.status).toBe(DepositStatus.PENDING)

        const depositInstance = await depositService._updateStatusTransaction(
          deposit._id,
          DepositStatus.CANCELLED
        )

        expect(depositInstance.object.status).toBe(DepositStatus.CANCELLED)

        expect(depositInstance.instance.onFailed).toContain(
          `Set the status of the deposit with an id of (${depositInstance.instance.model._id}) to (${DepositStatus.PENDING})`
        )
      })
    })
    describe('given deposit was approved', () => {
      it('should return a deposit transaction instance with approved status', async () => {
        request
        const deposit = await depositModel.create(depositA)

        expect(deposit.status).toBe(DepositStatus.PENDING)

        const depositInstance = await depositService._updateStatusTransaction(
          deposit._id,
          DepositStatus.APPROVED
        )

        expect(depositInstance.object.status).toBe(DepositStatus.APPROVED)

        expect(depositInstance.instance.onFailed).toContain(
          `Set the status of the deposit with an id of (${depositInstance.instance.model._id}) to (${DepositStatus.PENDING})`
        )
      })
    })
  })
})
