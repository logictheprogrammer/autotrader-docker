import AssetService from '../../../modules/asset/asset.service'
import {
  assetA,
  assetA_id,
  assetB,
  assetB_id,
  assetC,
  assetC_id,
} from './asset.payload'

export const getAssetMock = jest
  .spyOn(AssetService.prototype, 'get')
  .mockImplementation((assetId, assetType) => {
    if (assetId.toString() === assetA_id.toString()) {
      return Promise.resolve({
        ...assetA,
        _id: assetA_id,
        __v: 0,
        updatedAt: 'date',
        createdAt: 'date',
      })
    } else if (assetId.toString() === assetB_id.toString()) {
      return Promise.resolve({
        ...assetB,
        _id: assetB_id,
        __v: 0,
        updatedAt: 'date',
        createdAt: 'date',
      })
    } else if (assetId.toString() === assetC_id.toString()) {
      return Promise.resolve({
        ...assetC,
        _id: assetC_id,
        __v: 0,
        updatedAt: 'date',
        createdAt: 'date',
      })
    } else {
      return Promise.resolve(null)
    }
  })