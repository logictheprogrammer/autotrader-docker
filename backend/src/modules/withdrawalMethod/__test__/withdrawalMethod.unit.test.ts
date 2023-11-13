import { request } from '../../../test'
import withdrawalMethodModel from '../../../modules/withdrawalMethod/withdrawalMethod.model'
import { withdrawalMethodA } from './withdrawalMethod.payload'
import { withdrawalMethodService } from '../../../setup'
import { Types } from 'mongoose'
import Helpers from '../../../utils/helpers'

describe('withdrawal method', () => {
  request
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(withdrawalMethodService)
      expect(methods).toEqual([
        'withdrawalMethodModel',
        'create',
        'update',
        'fetch',
        'delete',
        'updateStatus',
        'fetchAll',
        'count',
      ])
    })
  })
  describe('fetch withdrawal method', () => {
    describe('given withdrawal method those not exist', () => {
      it('should throw an error', async () => {
        try {
          await withdrawalMethodService.fetch({ _id: new Types.ObjectId() })
        } catch (error: any) {
          expect(error.message).toBe('Withdrawal method not found')
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
