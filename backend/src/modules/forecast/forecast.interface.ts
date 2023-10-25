import { ForecastMove, ForecastStatus } from '@/modules/forecast/forecast.enum'
import { IPlan, IPlanObject } from '@/modules/plan/plan.interface'

import { AssetType } from '@/modules/asset/asset.enum'
import { IPair, IPairObject } from '@/modules/pair/pair.interface'
import { FilterQuery, ObjectId } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'

export interface IForecastObject extends baseObjectInterface {
  plan: IPlan['_id']
  pair: IPair['_id']
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

// @ts-ignore
export interface IForecast extends baseModelInterface, IForecastObject {}

export interface IForecastService {
  getTodaysTotalForecast(planObject: IPlanObject): Promise<number>

  create(
    plan: IPlanObject,
    pair: IPairObject,
    percentageProfit: number,
    stakeRate: number
  ): Promise<{ forecast: IForecastObject; errors: any[] }>

  autoCreate(): Promise<{ forecasts: IForecastObject[]; errors: any[] }>

  manualCreate(
    planId: ObjectId,
    pairId: ObjectId,
    percentageProfit: number,
    stakeRate: number
  ): Promise<{ forecast: IForecastObject; errors: any[] }>

  update(
    filter: FilterQuery<IForecast>,
    pairId: ObjectId,
    percentageProfit: number,
    stakeRate: number,
    move?: ForecastMove,
    openingPrice?: number,
    closingPrice?: number
  ): Promise<IForecastObject>

  updateStatus(
    filter: FilterQuery<IForecast>,
    status: ForecastStatus
  ): Promise<{ forecast: IForecastObject; errors: any[] }>

  autoUpdateStatus(): Promise<{ forecasts: IForecastObject[]; errors: any[] }>

  manualUpdateStatus(
    filter: FilterQuery<IForecast>,
    status: ForecastStatus
  ): Promise<{ forecast: IForecastObject; errors: any[] }>

  fetchAll(filter: FilterQuery<IForecast>): Promise<IForecastObject[]>

  delete(filter: FilterQuery<IForecast>): Promise<IForecastObject>
}
