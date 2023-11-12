import { ForecastMove, ForecastStatus } from '@/modules/forecast/forecast.enum'
import { IPlan, IPlanObject } from '@/modules/plan/plan.interface'

import { AssetType } from '@/modules/asset/asset.enum'
import { IPair, IPairObject } from '@/modules/pair/pair.interface'
import { FilterQuery, ObjectId } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'
import { PlanMode } from '../plan/plan.enum'

export interface IForecastObject extends baseObjectInterface {
  plan: IPlan['_id']
  pair: IPair['_id']
  market: AssetType
  status: ForecastStatus
  move?: ForecastMove
  percentageProfit?: number
  stakeRate: number
  openingPrice?: number
  closingPrice?: number
  runTime: number
  timeStamps: number[]
  startTime?: Date
  mode: PlanMode
}

// @ts-ignore
export interface IForecast extends baseModelInterface, IForecastObject {}

export interface IForecastService {
  create(
    plan: IPlanObject,
    pair: IPairObject,
    stakeRate: number,
    mode: PlanMode
  ): Promise<{ forecast?: IForecastObject; errors: any[] }>

  autoCreate(
    plan: IPlanObject
  ): Promise<{ forecast?: IForecastObject; errors: any[] }>

  manualCreate(
    planId: ObjectId,
    pairId: ObjectId,
    stakeRate: number,
    mode: PlanMode
  ): Promise<{ forecast?: IForecastObject; errors: any[] }>

  update(
    filter: FilterQuery<IForecast>,
    pairId: ObjectId,
    stakeRate: number,
    percentageProfit?: number,
    move?: ForecastMove,
    openingPrice?: number,
    closingPrice?: number
  ): Promise<{ forecast?: IForecastObject; errors: any[] }>

  updateStatus(
    filter: FilterQuery<IForecast>,
    status: ForecastStatus,
    percentageProfit?: number
  ): Promise<{ forecast?: IForecastObject; errors: any[] }>

  autoUpdateStatus(
    plan: IPlanObject
  ): Promise<{ forecast?: IForecastObject; errors: any[] }>

  manualUpdateStatus(
    filter: FilterQuery<IForecast>,
    status: ForecastStatus,
    percentageProfit?: number
  ): Promise<{ forecast?: IForecastObject; errors: any[] }>

  fetchAll(filter: FilterQuery<IForecast>): Promise<IForecastObject[]>

  delete(filter: FilterQuery<IForecast>): Promise<IForecastObject>

  count(filter: FilterQuery<IForecast>): Promise<number>
}
