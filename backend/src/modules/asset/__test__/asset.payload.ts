import { AssetType } from './../asset.enum'
import { IAssetObject } from '../asset.interface'
import { Types } from 'mongoose'

export const assetA_id = new Types.ObjectId('6145de5d5c4f5b3a5c1b539a')
// @ts-ignore
export const assetA: IAssetObject = {
  name: 'bitcoin',
  symbol: 'btc',
  logo: 'btc.svg',
  type: AssetType.CRYPTO,
}

export const assetB_id = new Types.ObjectId('6145de5d5c4f5b3a5c1b539b')
// @ts-ignore
export const assetB: IAssetObject = {
  name: 'ethereum',
  symbol: 'eth',
  logo: 'eth.svg',
  type: AssetType.CRYPTO,
}

export const assetC_id = new Types.ObjectId('6145de5d5c4f5b3a5c1b539c')
// @ts-ignore
export const assetC: IAssetObject = {
  name: 'litecoin',
  symbol: 'ltc',
  logo: 'ltc.svg',
  type: AssetType.CRYPTO,
}
