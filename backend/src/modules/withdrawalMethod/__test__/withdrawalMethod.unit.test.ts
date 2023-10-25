import { request } from '../../../test'
import withdrawalMethodModel from '../../../modules/withdrawalMethod/withdrawalMethod.model'
import { withdrawalMethodA } from './withdrawalMethod.payload'
import { withdrawalMethodService } from '../../../setup'
import { IWithdrawalMethod } from '../withdrawalMethod.interface'
import { Types } from 'mongoose'

describe('withdrawal method', () => {
  request
  describe('fetch withdrawal method', () => {
    describe('given withdrawal method those not exist', () => {
      it('should throw an error', async () => {
        try {
          await withdrawalMethodService.fetch({ _id: new Types.ObjectId() })
        } catch (error: any) {
          expect(error.error.message).toBe('Withdrawal method not found')
        }
      })
    })

    describe('given withdrawal method exist', () => {
      it('should return the withdrawalMethod payload', async () => {
        const withdrawalMethod = await withdrawalMethodModel.create(
          withdrawalMethodA
        )

        const result = await withdrawalMethodService.fetch({
          _id: withdrawalMethod._id,
        })

        expect(result._id).toEqual(withdrawalMethod._id)
      })
    })
  })
})
