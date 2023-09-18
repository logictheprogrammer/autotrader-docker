import { request } from '../../../test'
import planModel from '../../../modules/plan/plan.model'
import { planA } from './plan.payload'
import { assetService, planService } from '../../../setup'
import assetModel from '../../asset/asset.model'
import { assetA, assetA_id } from '../../asset/__test__/asset.payload'
import { IPlan } from '../plan.interface'
import { IAsset } from '../../asset/asset.interface'
import { Types } from 'mongoose'

describe('plan', () => {
  request
  describe('get plan', () => {
    describe('given plan those not exist', () => {
      it('should throw an error', async () => {
        expect(await planService.get(new Types.ObjectId())).toBe(null)
      })
    })

    describe('given plan exist', () => {
      it('should return the plan payload', async () => {
        await assetModel.create({ ...assetA, _id: assetA_id })
        const plan = await planModel.create(planA)

        const assetsObj: any[] = []

        for (const assetId of plan.assets) {
          const asset = await assetService.get(assetId, plan.assetType)
          if (asset) assetsObj.push(asset)
        }

        plan.assets = assetsObj

        const result = await planService.get(plan._id)

        expect(result).toEqual(plan.toObject({ getters: true }))
      })
    })
  })

  test.todo('get all auto plans')
})
