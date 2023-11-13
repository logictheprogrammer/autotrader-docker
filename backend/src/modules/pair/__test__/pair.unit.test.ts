import pairModel from '../../pair/pair.model'
import { request } from '../../../test'
import { pairA } from './pair.payload'
import { pairService } from '../../../setup'
import { Types } from 'mongoose'
import Helpers from '../../../utils/helpers'

describe('pair', () => {
  request
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(pairService)
      expect(methods).toEqual([
        'pairModel',
        'fetch',
        'create',
        'update',
        'fetchAll',
        'count',
      ])
    })
  })
  describe('fetch', () => {
    describe('given pair those not exist', () => {
      it('should throw an error', async () => {
        await expect(
          pairService.fetch({ _id: new Types.ObjectId() })
        ).rejects.toThrowError('Pair not found')
      })
    })

    describe('given pair exist', () => {
      it('should return the pair payload', async () => {
        const pair = await pairModel.create(pairA)

        const result = await pairService.fetch(pair._id)

        expect(result._id).toEqual(pair._id)
      })
    })
  })
})
