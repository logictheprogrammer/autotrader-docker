import { PlanMode, PlanStatus } from '@/modules/plan/plan.enum'
import { AssetType } from '@/modules/asset/asset.enum'
import { IInvestment } from '../investment/investment.interface'
import { FilterQuery, ObjectId } from 'mongoose'
import { IAsset } from '../asset/asset.interface'
import { IForecast, IForecastObject } from '../forecast/forecast.interface'
import { ForecastStatus } from '../forecast/forecast.enum'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'

export interface IPlanObject extends baseObjectInterface {
  icon: string
  name: string
  engine: string
  minAmount: number
  maxAmount: number
  minPercentageProfit: number
  maxPercentageProfit: number
  winRate: number
  tradingDays: number
  dailyForecasts: number
  gas: number
  description: string
  assetType: AssetType
  assets: IAsset['_id'][]
  status: PlanStatus
  mode: PlanMode
  investors: IInvestment['_id'][]
  dummyInvestors: number
  runTime: number
  currentForecast?: IForecast['_id']
  forecastStatus?: ForecastStatus
  forecastTimeStamps: number[]
  forecastStartTime?: Date
}

// @ts-ignore
export interface IPlan extends baseModelInterface, IPlanObject {}

export interface IPlanService {
  create(
    icon: string,
    name: string,
    engine: string,
    minAmount: number,
    maxAmount: number,
    minPercentageProfit: number,
    maxPercentageProfit: number,
    winRate: number,
    tradingDays: number,
    dailyForecasts: number,
    gas: number,
    description: string,
    assetType: AssetType,
    assets: ObjectId[]
  ): Promise<IPlanObject>

  update(
    filter: FilterQuery<IPlan>,
    icon: string,
    name: string,
    engine: string,
    minAmount: number,
    maxAmount: number,
    minPercentageProfit: number,
    maxPercentageProfit: number,
    winRate: number,
    tradingDays: number,
    dailyForecasts: number,
    gas: number,
    description: string,
    assetType: AssetType,
    assets: ObjectId[]
  ): Promise<IPlanObject>

  updateStatus(
    filter: FilterQuery<IPlan>,
    status: PlanStatus
  ): Promise<IPlanObject>

  updateForecastDetails(
    filter: FilterQuery<IPlan>,
    forecastObject: IForecastObject
  ): Promise<IPlanObject>

  fetch(filter: FilterQuery<IPlan>): Promise<IPlanObject>

  delete(filter: FilterQuery<IPlan>): Promise<IPlanObject>

  fetchAll(filter: FilterQuery<IPlan>): Promise<IPlanObject[]>
}
