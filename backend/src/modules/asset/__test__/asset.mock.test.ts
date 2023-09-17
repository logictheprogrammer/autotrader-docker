import assetModel from '../../../modules/asset/asset.model'
import { request } from '../../../test'
import { assetA } from './asset.payload'
import { assetService } from '../../../setup'
import { AssetType } from '../asset.enum'
import { IAsset } from '../asset.interface'
import { Types } from 'mongoose'

describe('asset', () => {
  request
  describe('get', () => {
    describe('given asset those not exist', () => {
      it('should throw an error', async () => {
        expect(
          await assetService.get(new Types.ObjectId(), AssetType.CRYPTO)
        ).toBe(undefined)
      })
    })

    describe('given asset 2 those not exist', () => {
      it('should throw an error', async () => {
        const asset = await assetModel.create(assetA)

        expect(await assetService.get(asset._id, AssetType.FOREX)).toBe(
          undefined
        )
      })
    })

    describe('given asset exist', () => {
      it('should return the asset payload', async () => {
        const asset = await assetModel.create(assetA)

        const result = await assetService.get(asset._id, AssetType.CRYPTO)

        expect(result).toEqual(asset.toObject({ getters: true }))
      })
    })
  })
})
