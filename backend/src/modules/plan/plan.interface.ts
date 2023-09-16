import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { PlanStatus } from '@/modules/plan/plan.enum'
import { UserRole } from '@/modules/user/user.enum'
import { AssetType } from '@/modules/asset/asset.enum'
import { IInvestment } from '../investment/investment.interface'
import { Document, ObjectId } from 'mongoose'
import { IAsset } from '../asset/asset.interface'

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
  assets: IAsset['_id'][]
  status: PlanStatus
  manualMode: boolean
  investors: IInvestment['_id'][]
  dummyInvestors: number
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
  assets: IAsset['_id'][]
  status: PlanStatus
  manualMode: boolean
  investors: IInvestment['_id'][]
  dummyInvestors: number
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
    assets: ObjectId[]
  ): THttpResponse<{ plan: IPlan }>

  update(
    planId: ObjectId,
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
    assets: ObjectId[]
  ): THttpResponse<{ plan: IPlan }>

  // autoTrade(): Promise<void>

  // manualTrade(): Promise<void>

  updateStatus(
    planId: ObjectId,
    status: PlanStatus
  ): THttpResponse<{ plan: IPlan }>

  get(planId: ObjectId): Promise<IPlanObject | null>

  delete(planId: ObjectId): THttpResponse<{ plan: IPlan }>

  fetchAll(role: UserRole): THttpResponse<{ plans: IPlan[] }>
}
