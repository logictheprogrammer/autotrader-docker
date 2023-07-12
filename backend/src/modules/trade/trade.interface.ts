import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import { Document } from 'mongoose'
import { TradeMove, TradeStatus } from '@/modules/trade/trade.enum'
import {
  IInvestment,
  IInvestmentObject,
} from '@/modules/investment/investment.interface'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { IServiceObject } from '@/modules/service/service.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { UserAccount, UserEnvironment } from '@/modules/user/user.enum'
import { Types } from 'mongoose'
import { AssetType } from '../asset/asset.enum'
import { IPair, IPairObject } from '../pair/pair.interface'
import { TUpdateTradeStatus } from './trade.type'

export interface ITradeObject extends IServiceObject {
  investment: IInvestment['_id']
  investmentObject: IInvestmentObject
  user: IUser['_id']
  userObject: IUserObject
  pair: IPair['_id']
  pairObject: IPairObject
  market: AssetType
  status: TradeStatus
  move: TradeMove
  stake: number
  outcome: number
  profit: number
  percentage: number
  investmentPercentage: number
  openingPrice?: number
  closingPrice?: number
  startTime?: Date
  stopTime?: Date
  environment: UserEnvironment
  manualUpdateAmount: boolean
  manualMode: boolean
}

export interface ITrade extends Document {
  investment: IInvestment['_id']
  investmentObject: IInvestmentObject
  user: IUser['_id']
  userObject: IUserObject
  pair: IPair['_id']
  pairObject: IPairObject
  market: AssetType
  status: TradeStatus
  move: TradeMove
  stake: number
  outcome: number
  profit: number
  percentage: number
  investmentPercentage: number
  openingPrice?: number
  closingPrice?: number
  startTime?: Date
  stopTime?: Date
  environment: UserEnvironment
  manualUpdateAmount: boolean
  manualMode: boolean
}

export interface ITradeService {
  _createTransaction(
    user: IUserObject,
    investment: IInvestmentObject,
    pair: IPairObject,
    move: TradeMove,
    stake: number,
    outcome: number,
    profit: number,
    percentage: number,
    investmentPercentage: number,
    environment: UserEnvironment,
    manualMode: boolean
  ): TTransaction<ITradeObject, ITrade>

  _updateStatusTransaction(
    tradeId: Types.ObjectId,
    status: TradeStatus
  ): TTransaction<ITradeObject, ITrade>

  create(
    user: IUserObject,
    investment: IInvestmentObject,
    pair: IPairObject,
    move: TradeMove,
    stakeRate: number,
    investmentPercentage: number
  ): Promise<ITransactionInstance<ITrade>>

  createManual(
    investmentId: Types.ObjectId,
    pairId: Types.ObjectId
  ): THttpResponse<{ trade: ITrade }>

  updateManual(
    tradeId: Types.ObjectId,
    pairId: Types.ObjectId,
    move: TradeMove,
    stake: number,
    profit: number,
    openingPrice?: number,
    closingPrice?: number,
    startTime?: Date,
    stopTime?: Date
  ): THttpResponse<{ trade: ITrade }>

  updateAmount(
    tradeId: Types.ObjectId,
    stake: number,
    profit: number
  ): THttpResponse<{ trade: ITrade }>

  updateStatus(
    tradeId: Types.ObjectId,
    status: TradeStatus,
    price?: number
  ): Promise<{ model: ITrade; instances: TUpdateTradeStatus }>

  forceUpdateStatus(
    tradeId: Types.ObjectId,
    status: TradeStatus
  ): THttpResponse<{ trade: ITrade }>

  fetchAll(
    all: boolean,
    environment: UserEnvironment,
    userId?: string
  ): THttpResponse<{ trades: ITrade[] }>

  delete(tradeId: Types.ObjectId): THttpResponse<{ trade: ITrade }>
}
