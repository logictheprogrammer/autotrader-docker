import assetModel from '../../../modules/asset/asset.model'
import { request } from '../../../test'
import { assetA } from './asset.payload'
import { assetService } from '../../../setup'
import { AssetType } from '../asset.enum'
import AppRepository from '../../app/app.repository'
import { IAsset } from '../asset.interface'
import AppObjectId from '../../app/app.objectId'

const assetRepository = new AppRepository<IAsset>(assetModel)

describe('asset', () => {
  request
  describe('get', () => {
    describe('given asset those not exist', () => {
      it('should throw an error', async () => {
        expect(
          await assetService.get(new AppObjectId(), AssetType.CRYPTO)
        ).toBe(undefined)
      })
    })

    describe('given asset 2 those not exist', () => {
      it('should throw an error', async () => {
        const asset = await assetRepository.create(assetA).save()

        expect(await assetService.get(asset._id, AssetType.FOREX)).toBe(
          undefined
        )
      })
    })

    describe('given asset exist', () => {
      it('should return the asset payload', async () => {
        const asset = await assetRepository.create(assetA).save()

        const result = await assetService.get(asset._id, AssetType.CRYPTO)

        expect(result).toEqual(assetRepository.toObject(asset))
      })
    })
  })
})
