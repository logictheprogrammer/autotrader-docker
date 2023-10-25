import { request } from '../../../test'
import planModel from '../../../modules/plan/plan.model'
import { planA } from './plan.payload'
import { planService } from '../../../setup'
import assetModel from '../../asset/asset.model'
import { assetA, assetA_id } from '../../asset/__test__/asset.payload'
import { Types } from 'mongoose'

describe('plan', () => {
  request
  describe('fetch plan', () => {
    describe('given plan those not exist', () => {
      it('should throw an error', async () => {
        await expect(
          planService.fetch({ _id: new Types.ObjectId() })
        ).rejects.toThrowError('Unable to fetch plan, please try again')
      })
    })

    describe('given plan exist', () => {
      it('should return the plan payload', async () => {
        await assetModel.create({ ...assetA, _id: assetA_id })
        const plan = await planModel.create(planA)

        await plan.populate('assets')

        const result = await planService.fetch(plan._id)

        expect(result._id).toEqual(plan._id)
      })
    })
  })

  test.todo('get all auto plans')
})
