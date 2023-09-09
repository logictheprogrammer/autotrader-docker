import type { AssetType } from '../asset/asset.enum'
import type { IAsset } from '../asset/asset.interface'
import type { PlanStatus } from './plan.enum'

export interface IPlan {
  __v: number
  _id: string
  currency: string
  updatedAt: Date
  createdAt: Date
  icon: string
  name: string
  engine: string
  minAmount: number
  maxAmount: number
  minProfit: number
  maxProfit: number
  duration: number
  dailyTrades: number
  gas: number
  description: string
  assetType: AssetType
  assets: IAsset[]
  status: PlanStatus
}

export interface ICreatePlan {
  name: string
  engine: string
  minAmount: number
  maxAmount: number
  minProfit: number
  maxProfit: number
  duration: number
  dailyTrades: number
  gas: number
  description: string
  assetType: AssetType
  assets: string[]
}

export interface IEditPlan {
  planId: string
  name: string
  engine: string
  minAmount: number
  maxAmount: number
  minProfit: number
  maxProfit: number
  duration: number
  dailyTrades: number
  gas: number
  description: string
  assetType: AssetType
  assets: string[]
}

export interface IUpdatePlanStatus {
  planId: string
  status: PlanStatus
}
