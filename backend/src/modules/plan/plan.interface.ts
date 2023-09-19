import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { PlanStatus } from '@/modules/plan/plan.enum'
import { UserRole } from '@/modules/user/user.enum'
import { AssetType } from '@/modules/asset/asset.enum'
import { IInvestment } from '../investment/investment.interface'
import { Document, ObjectId, Types } from 'mongoose'
import { IAsset } from '../asset/asset.interface'
import { ITransactionInstance } from '../transactionManager/transactionManager.interface'
import { IForecast, IForecastObject } from '../forecast/forecast.interface'
import { TTransaction } from '../transactionManager/transactionManager.type'
import { ForecastStatus } from '../forecast/forecast.enum'

export interface IPlanObject extends IAppObject {
  icon: string
  name: string
  engine: string
  minAmount: number
  maxAmount: number
  minPercentageProfit: number
  maxPercentageProfit: number
  duration: number
  dailyForecasts: number
  gas: number
  description: string
  assetType: AssetType
  assets: IAsset['_id'][]
  status: PlanStatus
  manualMode: boolean
  investors: IInvestment['_id'][]
  dummyInvestors: number
  runTime: number
  currentForecast?: IForecast['_id']
  forecastStatus?: ForecastStatus
  forecastTimeStamps: number[]
  forecastStartTime?: Date
}

export interface IPlan extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  icon: string
  name: string
  engine: string
  minAmount: number
  maxAmount: number
  minPercentageProfit: number
  maxPercentageProfit: number
  duration: number
  dailyForecasts: number
  gas: number
  description: string
  assetType: AssetType
  assets: IAsset['_id'][]
  status: PlanStatus
  manualMode: boolean
  investors: IInvestment['_id'][]
  dummyInvestors: number
  runTime: number
  currentForecast?: IForecast['_id']
  forecastStatus?: ForecastStatus
  forecastTimeStamps: number[]
  forecastStartTime?: Date
}

export interface IPlanService {
  _updateForecastDetails(
    planId: ObjectId,
    forecastObject: IForecastObject
  ): TTransaction<IPlanObject, IPlan>

  create(
    icon: string,
    name: string,
    engine: string,
    minAmount: number,
    maxAmount: number,
    minPercentageProfit: number,
    maxPercentageProfit: number,
    duration: number,
    dailyForecasts: number,
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
    minPercentageProfit: number,
    maxPercentageProfit: number,
    duration: number,
    dailyForecasts: number,
    gas: number,
    description: string,
    assetType: AssetType,
    assets: ObjectId[]
  ): THttpResponse<{ plan: IPlan }>

  updateStatus(
    planId: ObjectId,
    status: PlanStatus
  ): THttpResponse<{ plan: IPlan }>

  updateForecastDetails(
    planId: ObjectId,
    forecastObject: IForecastObject
  ): Promise<ITransactionInstance<IPlan>>

  get(planId: ObjectId | Types.ObjectId): Promise<IPlanObject | null>

  getAllAutoIdled(): Promise<IPlanObject[]>

  getAllAutoRunning(): Promise<IPlanObject[]>

  delete(planId: ObjectId): THttpResponse<{ plan: IPlan }>

  fetchAll(role: UserRole): THttpResponse<{ plans: IPlan[] }>
}
