import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import { ForecastMove, ForecastStatus } from '@/modules/forecast/forecast.enum'
import {
  IInvestment,
  IInvestmentObject,
} from '@/modules/investment/investment.interface'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { UserEnvironment } from '@/modules/user/user.enum'
import { AssetType } from '../asset/asset.enum'
import { IPair, IPairObject } from '../pair/pair.interface'
import { Document, ObjectId } from 'mongoose'
import { IForecast, IForecastObject } from '../forecast/forecast.interface'
import { ITransaction } from '../transaction/transaction.interface'
import { INotification } from '../notification/notification.interface'

export interface ITradeObject extends IAppObject {
  investment: IInvestment['_id']
  investmentObject: IInvestmentObject
  forecast: IForecast['_id']
  forecastObject: IForecastObject
  user: IUser['_id']
  userObject: IUserObject
  pair: IPair['_id']
  pairObject: IPairObject
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
  manualMode: boolean
}

export interface ITrade extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  investment: IInvestment['_id']
  investmentObject: IInvestmentObject
  forecast: IForecast['_id']
  forecastObject: IForecastObject
  user: IUser['_id']
  userObject: IUserObject
  pair: IPair['_id']
  pairObject: IPairObject
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
  manualMode: boolean
}

export interface ITradeService {
  _createTransaction(
    user: IUserObject,
    investment: IInvestmentObject,
    forecast: IForecastObject,
    stake: number,
    outcome: number,
    profit: number,
    percentage: number,
    environment: UserEnvironment,
    manualMode: boolean
  ): TTransaction<ITradeObject, ITrade>

  _updateTransaction(
    investment: IInvestmentObject,
    forecast: IForecastObject,
    stake: number,
    outcome: number,
    profit: number,
    percentage: number
  ): TTransaction<ITradeObject, ITrade>

  _updateStatusTransaction(
    investment: IInvestmentObject,
    forecast: IForecastObject
  ): TTransaction<ITradeObject, ITrade>

  create(
    userId: ObjectId,
    investment: IInvestmentObject,
    forecast: IForecastObject
  ): Promise<
    ITransactionInstance<ITransaction | INotification | ITrade | IInvestment>[]
  >

  update(
    investment: IInvestmentObject,
    forecast: IForecastObject
  ): Promise<ITransactionInstance<ITrade | IInvestment>[]>

  updateStatus(
    investment: IInvestmentObject,
    forecast: IForecastObject
  ): Promise<
    ITransactionInstance<ITransaction | INotification | ITrade | IInvestment>[]
  >

  fetchAll(
    all: boolean,
    environment: UserEnvironment,
    userId?: string
  ): THttpResponse<{ trades: ITrade[] }>

  delete(tradeId: ObjectId): THttpResponse<{ trade: ITrade }>
}
