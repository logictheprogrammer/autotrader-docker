import { IBaseObject } from '@/util/interface'
import type { AssetType } from './asset.enum'

export interface IAsset extends IBaseObject {
  name: string
  symbol: string
  logo: string
  type: AssetType
}
