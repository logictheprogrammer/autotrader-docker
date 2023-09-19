import { ForecastMove, ForecastStatus } from '@/modules/forecast/forecast.enum'
import { IPlan, IPlanObject } from '@/modules/plan/plan.interface'
import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { AssetType } from '@/modules/asset/asset.enum'
import { IPair, IPairObject } from '@/modules/pair/pair.interface'
import { TUpdateForecastStatus } from '@/modules/forecast/forecast.type'
import { Document, ObjectId, Types } from 'mongoose'

export interface IForecastObject extends IAppObject {
  plan: IPlan['_id']
  planObject: IPlanObject
  pair: IPair['_id']
  pairObject: IPairObject
  market: AssetType
  status: ForecastStatus
  move?: ForecastMove
  percentageProfit: number
  stakeRate: number
  openingPrice?: number
  closingPrice?: number
  runTime: number
  timeStamps: number[]
  startTime?: Date
  manualMode: boolean
}

export interface IForecast extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  plan: IPlan['_id']
  planObject: IPlanObject
  pair: IPair['_id']
  pairObject: IPairObject
  market: AssetType
  status: ForecastStatus
  move?: ForecastMove
  percentageProfit: number
  stakeRate: number
  openingPrice?: number
  closingPrice?: number
  runTime: number
  timeStamps: number[]
  startTime?: Date
  manualMode: boolean
}

export interface IForecastService {
  _createTransaction(
    plan: IPlanObject,
    pair: IPairObject,
    percentageProfit: number,
    stakeRate: number
  ): TTransaction<IForecastObject, IForecast>

  _updateTransaction(
    forecastId: ObjectId,
    pair: IPairObject,
    percentageProfit: number,
    stakeRate: number,
    move?: ForecastMove,
    openingPrice?: number,
    closingPrice?: number
  ): TTransaction<IForecastObject, IForecast>

  _updateStatusTransaction(
    forecastId: ObjectId | Types.ObjectId,
    status: ForecastStatus,
    move?: ForecastMove
  ): TTransaction<IForecastObject, IForecast>

  getTodaysTotalForecast(planObject: IPlanObject): Promise<number>

  create(
    plan: IPlanObject,
    pair: IPairObject,
    percentageProfit: number,
    stakeRate: number
  ): Promise<IForecast>

  autoCreate(): Promise<void>

  manualCreate(
    planId: ObjectId,
    pairId: ObjectId,
    percentageProfit: number,
    stakeRate: number
  ): THttpResponse<{ forecast: IForecast }>

  update(
    forecastId: ObjectId,
    pairId: ObjectId,
    percentageProfit: number,
    stakeRate: number,
    move?: ForecastMove,
    openingPrice?: number,
    closingPrice?: number
  ): THttpResponse<{ forecast: IForecast }>

  updateStatus(forecastId: ObjectId, status: ForecastStatus): Promise<IForecast>

  autoUpdateStatus(): Promise<void>

  fetchAll(planId: ObjectId): THttpResponse<{ forecasts: IForecast[] }>

  delete(forecastId: ObjectId): THttpResponse<{ forecast: IForecast }>
}
