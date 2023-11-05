import { ForecastMove, ForecastStatus } from '@/modules/forecast/forecast.enum'
import {
  IInvestment,
  IInvestmentObject,
} from '@/modules/investment/investment.interface'
import { IUser } from '@/modules/user/user.interface'
import { UserEnvironment } from '@/modules/user/user.enum'
import { AssetType } from '../asset/asset.enum'
import { IPair } from '../pair/pair.interface'
import { FilterQuery, ObjectId } from 'mongoose'
import { IForecast, IForecastObject } from '../forecast/forecast.interface'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'
import { PlanMode } from '../plan/plan.enum'

export interface ITradeObject extends baseObjectInterface {
  investment: IInvestment['_id']
  forecast: IForecast['_id']
  user: IUser['_id']
  pair: IPair['_id']
  market: AssetType
  status: ForecastStatus
  move?: ForecastMove
  stake: number
  outcome: number
  profit: number
  percentage: number
  percentageProfit: number
  openingPrice?: number
  closingPrice?: number
  runTime: number
  timeStamps: number[]
  startTime?: Date
  environment: UserEnvironment
  mode: PlanMode
}

// @ts-ignore
export interface ITrade extends baseModelInterface, ITradeObject {}

export interface ITradeService {
  create(
    userId: ObjectId,
    investment: IInvestmentObject,
    forecast: IForecastObject
  ): Promise<ITradeObject>

  update(
    investment: IInvestmentObject,
    forecast: IForecastObject
  ): Promise<ITradeObject>

  updateStatus(
    investment: IInvestmentObject,
    forecast: IForecastObject
  ): Promise<ITradeObject>

  fetchAll(filter: FilterQuery<ITrade>): Promise<ITradeObject[]>

  delete(filter: FilterQuery<ITrade>): Promise<ITradeObject>
}
