import pairModel from '../../pair/pair.model'
import { request } from '../../../test'
import { pairA } from './pair.payload'
import { pairService } from '../../../setup'
import { IPair } from '../pair.interface'
import { Types } from 'mongoose'

describe('pair', () => {
  request
  describe('get', () => {
    describe('given pair those not exist', () => {
      it('should throw an error', async () => {
        expect(await pairService.get(new Types.ObjectId())).toBe(null)
      })
    })

    describe('given pair exist', () => {
      it('should return the pair payload', async () => {
        const pair = await pairModel.create(pairA)

        const result = await pairService.get(pair._id)

        expect(result).toEqual(pair.toObject({ getters: true }))
      })
    })
  })
})
