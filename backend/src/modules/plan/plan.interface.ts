import { PlanStatus } from '@/modules/plan/plan.enum'
import { AssetType } from '@/modules/asset/asset.enum'
import { IInvestmentObject } from '../investment/investment.interface'
import { FilterQuery, ObjectId } from 'mongoose'
import { IAssetObject } from '../asset/asset.interface'
import { IForecastObject } from '../forecast/forecast.interface'
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
  duration: number
  dailyForecasts: number
  gas: number
  description: string
  assetType: AssetType
  assets: IAssetObject[]
  status: PlanStatus
  manualMode: boolean
  investors: IInvestmentObject[]
  dummyInvestors: number
  runTime: number
  currentForecast?: IForecastObject
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
    duration: number,
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
    duration: number,
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
