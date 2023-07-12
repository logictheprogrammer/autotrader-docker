import { Document, Types } from 'mongoose'
import { IServiceObject } from '@/modules/service/service.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { PlanStatus } from '@/modules/plan/plan.enum'
import { UserRole } from '@/modules/user/user.enum'
import { AssetType } from '@/modules/asset/asset.enum'

export interface IPlanObject extends IServiceObject {
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

export interface IPlan extends Document {
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
    assets: Types.ObjectId[]
  ): THttpResponse<{ plan: IPlan }>

  update(
    planId: Types.ObjectId,
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
    assets: Types.ObjectId[]
  ): THttpResponse<{ plan: IPlan }>

  updateStatus(
    planId: Types.ObjectId,
    status: PlanStatus
  ): THttpResponse<{ plan: IPlan }>

  get(planId: Types.ObjectId): Promise<IPlanObject | null>

  delete(planId: Types.ObjectId): THttpResponse<{ plan: IPlan }>

  fetchAll(role: UserRole): THttpResponse<{ plans: IPlan[] }>
}
