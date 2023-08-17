import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { PlanStatus } from '@/modules/plan/plan.enum'
import { UserRole } from '@/modules/user/user.enum'
import { AssetType } from '@/modules/asset/asset.enum'
import AppDocument from '../app/app.document'
import AppObjectId from '../app/app.objectId'

export interface IPlanObject extends IAppObject {
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
  assets: any[]
  status: PlanStatus
}

export interface IPlan extends AppDocument {
  __v: number
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
  assets: any[]
  status: PlanStatus
}

export interface IPlanService {
  create(
    icon: string,
    name: string,
    engine: string,
    minAmount: number,
    maxAmount: number,
    minProfit: number,
    maxProfit: number,
    duration: number,
    dailyTrades: number,
    gas: number,
    description: string,
    assetType: AssetType,
    assets: AppObjectId[]
  ): THttpResponse<{ plan: IPlan }>

  update(
    planId: AppObjectId,
    icon: string,
    name: string,
    engine: string,
    minAmount: number,
    maxAmount: number,
    minProfit: number,
    maxProfit: number,
    duration: number,
    dailyTrades: number,
    gas: number,
    description: string,
    assetType: AssetType,
    assets: AppObjectId[]
  ): THttpResponse<{ plan: IPlan }>

  updateStatus(
    planId: AppObjectId,
    status: PlanStatus
  ): THttpResponse<{ plan: IPlan }>

  get(planId: AppObjectId): Promise<IPlanObject | null>

  delete(planId: AppObjectId): THttpResponse<{ plan: IPlan }>

  fetchAll(role: UserRole): THttpResponse<{ plans: IPlan[] }>
}
