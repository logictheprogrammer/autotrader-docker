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
import { Types } from 'mongoose'
import AppRepository from '../../app/app.repository'
import { IDeposit } from '../deposit.interface'
import { IUser } from '../../user/user.interface'

const depositRepository = new AppRepository<IDeposit>(depositModel)
const depositMethodRepository = new AppRepository<IDepositMethod>(
  depositMethodModel
)
const userRepository = new AppRepository<IUser>(userModel)

describe('deposit', () => {
  describe('_createTransaction', () => {
    it('should return a deposit transaction instance', async () => {
      request
      const user = await userRepository.create(userA).save()
      const depositMethod = await depositMethodRepository
        .create(depositMethodA)
        .save()

      const userObj = userRepository.toObject(user)
      const depositMethodObj = depositMethodRepository.toObject(depositMethod)
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
      expect(
        depositInstance.instance.model.collectUnsaved().depositMethod
      ).toEqual(depositMethodObj._id)
      expect(depositInstance.instance.onFailed).toContain(
        `Delete the deposit with an id of (${
          depositInstance.instance.model.collectUnsaved()._id
        })`
      )
    })
  })
  describe('_updateStatusTransaction', () => {
    describe('given deposit id those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const deposit = await depositRepository
          .create({
            ...depositA,
            status: DepositStatus.CANCELLED,
          })
          .save()

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
        const deposit = await depositRepository
          .create({
            ...depositA,
            status: DepositStatus.CANCELLED,
          })
          .save()

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
        const deposit = await depositRepository.create(depositA).save()

        expect(deposit.status).toBe(DepositStatus.PENDING)

        const depositInstance = await depositService._updateStatusTransaction(
          deposit._id,
          DepositStatus.CANCELLED
        )

        expect(depositInstance.object.status).toBe(DepositStatus.CANCELLED)

        expect(depositInstance.instance.onFailed).toContain(
          `Set the status of the deposit with an id of (${
            depositInstance.instance.model.collectUnsaved()._id
          }) to (${DepositStatus.PENDING})`
        )
      })
    })
    describe('given deposit was approved', () => {
      it('should return a deposit transaction instance with approved status', async () => {
        request
        const deposit = await depositRepository.create(depositA).save()

        expect(deposit.status).toBe(DepositStatus.PENDING)

        const depositInstance = await depositService._updateStatusTransaction(
          deposit._id,
          DepositStatus.APPROVED
        )

        expect(depositInstance.object.status).toBe(DepositStatus.APPROVED)

        expect(depositInstance.instance.onFailed).toContain(
          `Set the status of the deposit with an id of (${
            depositInstance.instance.model.collectUnsaved()._id
          }) to (${DepositStatus.PENDING})`
        )
      })
    })
  })
})
