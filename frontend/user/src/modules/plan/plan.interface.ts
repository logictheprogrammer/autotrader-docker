import type { AssetType } from '../asset/asset.enum'
import type { IAsset } from '../asset/asset.interface'
import type { PlanStatus } from './plan.enum'
import { IBaseObject } from '@/util/interface'

export interface IPlan extends IBaseObject {
  icon: string
  name: string
  engine: string
  duration: number
  minAmount: number
  maxAmount: number
  dailyPercentageProfit: number
  potentialPercentageProfit: number
  description: string
  assetType: AssetType
  assets: IAsset[]
  status: PlanStatus
}
