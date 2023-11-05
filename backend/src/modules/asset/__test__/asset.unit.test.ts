import assetModel from '../../../modules/asset/asset.model'
import { request } from '../../../test'
import { assetA } from './asset.payload'
import { assetService } from '../../../setup'
import { AssetType } from '../asset.enum'
import { Types } from 'mongoose'

describe('asset', () => {
  request
  describe('fetch', () => {
    describe('given asset those not exist', () => {
      it('should throw an error', async () => {
        try {
          await assetService.fetch({
            _id: new Types.ObjectId().toString(),
            type: AssetType.CRYPTO,
          })
        } catch (error: any) {
          expect(error.message).toBe('Asset not found')
        }
      })
    })

    describe('given asset 2 those not exist', () => {
      it('should throw an error', async () => {
        const asset = await assetModel.create(assetA)

        try {
          await assetService.fetch({ _id: asset._id, type: AssetType.FOREX })
        } catch (error: any) {
          expect(error.message).toBe('Asset not found')
        }
      })
    })

    describe('given asset exist', () => {
      it('should return the asset payload', async () => {
        const asset = await assetModel.create(assetA)

        const result = await assetService.fetch({
          _id: asset._id,
          type: AssetType.CRYPTO,
        })

        expect(result._id).toEqual(asset._id)
        expect(result.name).toEqual(asset.name)
        expect(result.symbol).toEqual(asset.symbol)
        expect(result.logo).toEqual(asset.logo)
        expect(result.type).toEqual(asset.type)
      })
    })
  })
})
