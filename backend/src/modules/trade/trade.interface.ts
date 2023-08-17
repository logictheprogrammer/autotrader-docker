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
import AppRepository from '../app/app.repository'
import AppDocument from '../app/app.document'
import AppObjectId from '../app/app.objectId'

export interface ITradeObject extends IAppObject {
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

export interface ITrade extends AppDocument {
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
    tradeId: AppObjectId,
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
    investmentId: AppObjectId,
    pairId: AppObjectId
  ): THttpResponse<{ trade: ITrade }>

  updateManual(
    tradeId: AppObjectId,
    pairId: AppObjectId,
    move: TradeMove,
    stake: number,
    profit: number,
    openingPrice?: number,
    closingPrice?: number,
    startTime?: Date,
    stopTime?: Date
  ): THttpResponse<{ trade: ITrade }>

  updateAmount(
    tradeId: AppObjectId,
    stake: number,
    profit: number
  ): THttpResponse<{ trade: ITrade }>

  updateStatus(
    tradeId: AppObjectId,
    status: TradeStatus,
    price?: number
  ): Promise<{ model: AppRepository<ITrade>; instances: TUpdateTradeStatus }>

  forceUpdateStatus(
    tradeId: AppObjectId,
    status: TradeStatus
  ): THttpResponse<{ trade: ITrade }>

  fetchAll(
    all: boolean,
    environment: UserEnvironment,
    userId?: string
  ): THttpResponse<{ trades: ITrade[] }>

  delete(tradeId: AppObjectId): THttpResponse<{ trade: ITrade }>
}
