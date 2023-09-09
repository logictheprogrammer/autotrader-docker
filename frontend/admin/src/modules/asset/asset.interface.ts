import type { AssetType } from './asset.enum'

export interface IAsset {
  __v: number
  _id: string
  updatedAt: Date
  createdAt: Date
  name: string
  symbol: string
  logo: string
  type: AssetType
}
