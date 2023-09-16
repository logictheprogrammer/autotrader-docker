import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import { TradeMove, TradeStatus } from '@/modules/trade/trade.enum'
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
import { TUpdateTradeStatus } from './trade.type'
import { InvestmentStatus } from '../investment/investment.enum'
import { TUpdateInvestmentStatus } from '../investment/investment.type'
import { Document, ObjectId } from 'mongoose'

export interface ITradeObject extends IAppObject {
  investment: IInvestment['_id']
  investmentObject: IInvestmentObject
  user: IUser['_id']
  userObject: IUserObject
  pair: IPair['_id']
  pairObject: IPairObject
  market: AssetType
  status: TradeStatus
  move?: TradeMove
  stake: number
  outcome: number
  profit: number
  percentage: number
  investmentPercentage: number
  openingPrice?: number
  closingPrice?: number
  runTime: number
  timeStamps: number[]
  startTime?: Date
  environment: UserEnvironment
  manualUpdateAmount: boolean
  manualMode: boolean
}

export interface ITrade extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  investment: IInvestment['_id']
  investmentObject: IInvestmentObject
  user: IUser['_id']
  userObject: IUserObject
  pair: IPair['_id']
  pairObject: IPairObject
  market: AssetType
  status: TradeStatus
  move?: TradeMove
  stake: number
  outcome: number
  profit: number
  percentage: number
  investmentPercentage: number
  openingPrice?: number
  closingPrice?: number
  runTime: number
  timeStamps: number[]
  startTime?: Date
  environment: UserEnvironment
  manualUpdateAmount: boolean
  manualMode: boolean
}

export interface ITradeService {
  _createTransaction(
    user: IUserObject,
    investment: IInvestmentObject,
    pair: IPairObject,
    stake: number,
    outcome: number,
    profit: number,
    percentage: number,
    investmentPercentage: number,
    environment: UserEnvironment
  ): TTransaction<ITradeObject, ITrade>

  _updateStatusTransaction(
    tradeId: ObjectId,
    status: TradeStatus,
    move?: TradeMove
  ): TTransaction<ITradeObject, ITrade>

  create(
    user: IUserObject,
    investment: IInvestmentObject,
    pair: IPairObject,
    stakeRate: number,
    investmentPercentage: number
  ): TTransaction<ITradeObject, ITrade>

  createManual(
    investmentId: ObjectId,
    pairId: ObjectId,
    stake: number,
    profit: number
  ): THttpResponse<{ trade: ITrade }>

  updateManual(
    tradeId: ObjectId,
    pairId: ObjectId,
    move: TradeMove,
    stake: number,
    profit: number,
    openingPrice?: number,
    closingPrice?: number,
    startTime?: Date,
    stopTime?: Date
  ): THttpResponse<{ trade: ITrade }>

  updateAmount(
    tradeId: ObjectId,
    stake: number,
    profit: number
  ): THttpResponse<{ trade: ITrade }>

  updateStatus(
    tradeId: ObjectId,
    status: TradeStatus,
    move?: TradeMove
  ): Promise<{ model: ITrade; instances: TUpdateTradeStatus }>

  updateInvestmentStatus(
    investmentId: ObjectId,
    investmentStatus: InvestmentStatus
  ): Promise<{
    model: IInvestment
    instances: TUpdateInvestmentStatus
  }>

  forceUpdateInvestmentStatus(
    investmentId: ObjectId,
    status: InvestmentStatus
  ): THttpResponse<{ investment: IInvestment }>

  fetchAll(
    all: boolean,
    environment: UserEnvironment,
    userId?: string
  ): THttpResponse<{ trades: ITrade[] }>

  delete(tradeId: ObjectId): THttpResponse<{ trade: ITrade }>
}
