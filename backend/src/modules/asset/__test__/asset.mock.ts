import { assetService } from '../../../setup'
import {
  assetA,
  assetA_id,
  assetB,
  assetB_id,
  assetC,
  assetC_id,
} from './asset.payload'

export const fetchAssetMock = jest
  .spyOn(assetService, 'fetch')
  // @ts-ignore
  .mockImplementation(({ _id, type }) => {
    if (_id.toString() === assetA_id.toString()) {
      return Promise.resolve({
        ...assetA,
        _id: assetA_id,
        __v: 0,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (_id.toString() === assetB_id.toString()) {
      return Promise.resolve({
        ...assetB,
        _id: assetB_id,
        __v: 0,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else if (_id.toString() === assetC_id.toString()) {
      return Promise.resolve({
        ...assetC,
        _id: assetC_id,
        __v: 0,
        updatedAt: new Date(),
        createdAt: new Date(),
      })
    } else {
      return Promise.resolve(null)
    }
  })
