import pairModel from '../../pair/pair.model'
import { request } from '../../../test'
import { pairA } from './pair.payload'
import { pairService } from '../../../setup'
import AppRepository from '../../app/app.repository'
import { IPair } from '../pair.interface'
import AppObjectId from '../../app/app.objectId'

const pairRepository = new AppRepository<IPair>(pairModel)

describe('pair', () => {
  request
  describe('get', () => {
    describe('given pair those not exist', () => {
      it('should throw an error', async () => {
        expect(await pairService.get(new AppObjectId())).toBe(null)
      })
    })

    describe('given pair exist', () => {
      it('should return the pair payload', async () => {
        const pair = await pairRepository.create(pairA).save()

        const result = await pairService.get(pair._id)

        expect(result).toEqual(pairRepository.toObject(pair))
      })
    })
  })
})
