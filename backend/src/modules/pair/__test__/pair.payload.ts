import { Types } from 'mongoose'
import {
  assetA_id,
  assetB_id,
  assetC_id,
} from '../../asset/__test__/asset.payload'
import { AssetType } from '../../asset/asset.enum'
import { IPairObject } from '../pair.interface'

export const pairA_id = new Types.ObjectId('2345de5d5c4f5b3a5c1b539a')
// @ts-ignore
export const pairA: IPairObject = {
  assetType: AssetType.CRYPTO,
  baseAsset: assetA_id,
  quoteAsset: assetB_id,
}

export const pairB_id = new Types.ObjectId('2345de5d5c4f5b3a5c1b539b')
// @ts-ignore
export const pairB: IPairObject = {
  assetType: AssetType.CRYPTO,
  baseAsset: assetB_id,
  quoteAsset: assetC_id,
}

export const pairC_id = new Types.ObjectId('2345de5d5c4f5b3a5c1b539c')
// @ts-ignore
export const pairC: IPairObject = {
  assetType: AssetType.CRYPTO,
  baseAsset: assetA_id,
  quoteAsset: assetC_id,
}
