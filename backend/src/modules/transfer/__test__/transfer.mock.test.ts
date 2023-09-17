import { TransferStatus } from '../../transfer/transfer.enum'
import { request } from '../../../test'
import {
  userAObj,
  userA_id,
  userBObj,
  userB_id,
} from '../../user/__test__/user.payload'
import { transferService } from '../../../setup'
import transferModel from '../transfer.model'
import { transferA } from './transfer.payload'
import { UserAccount } from '../../user/user.enum'
import { ITransfer } from '../transfer.interface'
import { Types } from 'mongoose'

describe('transfer', () => {
  describe('_createTransaction', () => {
    it('should return a transfer transaction instance', async () => {
      request

      const fromUser = userAObj
      const toUser = userBObj
      const account = UserAccount.MAIN_BALANCE
      const status = TransferStatus.SUCCESSFUL
      const fee = 20
      const amount = 1000

      const transferInstance = await transferService._createTransaction(
        fromUser,
        toUser,
        account,
        status,
        fee,
        amount
      )

      expect(transferInstance.object.amount).toBe(amount)
      expect(transferInstance.object.fromUser.toString()).toBe(
        userA_id.toString()
      )
      expect(transferInstance.object.toUser.toString()).toBe(
        userB_id.toString()
      )
      expect(transferInstance.instance.onFailed).toBe(
        `Delete the transfer with an id of (${transferInstance.object._id})`
      )
    })
  })
  describe('_updateStatusTransaction', () => {
    describe('given transfer id those not exist', () => {
      it('should throw a 404 error', async () => {
        request

        await expect(
          transferService._updateStatusTransaction(
            new Types.ObjectId(),
            TransferStatus.SUCCESSFUL
          )
        ).rejects.toThrow('Transfer transaction not found')
      })
    })
    describe('given the status has already been settle', () => {
      it('should throw a 400 error', async () => {
        request
        const transfer = await transferModel.create({
          ...transferA,
          status: TransferStatus.SUCCESSFUL,
        })

        expect(transfer.status).toBe(TransferStatus.SUCCESSFUL)

        await expect(
          transferService._updateStatusTransaction(
            transfer._id,
            TransferStatus.SUCCESSFUL
          )
        ).rejects.toThrow('Transfer as already been settled')
      })
    })
    describe('given transfer was reversed', () => {
      it('should return a transfer transaction instance with reversed status', async () => {
        request
        const transfer = await transferModel.create(transferA)

        expect(transfer.status).toBe(TransferStatus.PENDING)

        const transferInstance = await transferService._updateStatusTransaction(
          transfer._id,
          TransferStatus.REVERSED
        )

        expect(transferInstance.object.status).toBe(TransferStatus.REVERSED)

        expect(transferInstance.instance.onFailed).toContain(
          `Set the status of the transfer with an id of (${transferInstance.instance.model._id}) to (${TransferStatus.PENDING})`
        )
      })
    })
    describe('given transfer was approved', () => {
      it('should return a transfer transaction instance with successful status', async () => {
        request
        const transfer = await transferModel.create(transferA)

        expect(transfer.status).toBe(TransferStatus.PENDING)

        const transferInstance = await transferService._updateStatusTransaction(
          transfer._id,
          TransferStatus.SUCCESSFUL
        )

        expect(transferInstance.object.status).toBe(TransferStatus.SUCCESSFUL)

        expect(transferInstance.instance.onFailed).toContain(
          `Set the status of the transfer with an id of (${transferInstance.instance.model._id}) to (${TransferStatus.PENDING})`
        )
      })
    })
  })
})
