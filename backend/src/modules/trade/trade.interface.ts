import { TradeMove, TradeStatus } from '@/modules/trade/trade.enum'
import { IPlan, IPlanObject } from '@/modules/plan/plan.interface'
import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { AssetType } from '@/modules/asset/asset.enum'
import { IPair, IPairObject } from '@/modules/pair/pair.interface'
import { TUpdateTradeStatus } from '@/modules/trade/trade.type'
import { Document, ObjectId, Types } from 'mongoose'

export interface ITradeObject extends IAppObject {
  plan: IPlan['_id']
  planObject: IPlanObject
  pair: IPair['_id']
  pairObject: IPairObject
  market: AssetType
  status: TradeStatus
  move?: TradeMove
  outcome: number
  openingPrice?: number
  closingPrice?: number
  change?: number
  runTime: number
  timeStamps: number[]
  startTime?: Date
  manualUpdateAmount: boolean
  manualMode: boolean
}

export interface ITrade extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  plan: IPlan['_id']
  planObject: IPlanObject
  pair: IPair['_id']
  pairObject: IPairObject
  market: AssetType
  status: TradeStatus
  move?: TradeMove
  outcome: number
  openingPrice?: number
  closingPrice?: number
  change?: number
  runTime: number
  timeStamps: number[]
  startTime?: Date
  manualMode: boolean
}

export interface ITradeService {
  _createTransaction(
    plan: IPlanObject,
    pair: IPairObject,
    outcome: number
  ): TTransaction<ITradeObject, ITrade>

  _updateStatusTransaction(
    tradeId: ObjectId | Types.ObjectId,
    status: TradeStatus,
    move?: TradeMove
  ): TTransaction<ITradeObject, ITrade>

  autoCreate(planId: ObjectId, pairId: ObjectId): Promise<void>

  manualCreate(
    planId: ObjectId,
    pairId: ObjectId,
    outcome: number
  ): THttpResponse<{ trade: ITrade }>

  manualUpdate(
    tradeId: ObjectId,
    pairId: ObjectId,
    outcome: number,
    status: TradeStatus,
    move?: TradeMove
  ): THttpResponse<{ trade: ITrade }>

  updateStatus(
    tradeId: ObjectId,
    status: TradeStatus
  ): Promise<{ model: ITrade; instances: TUpdateTradeStatus }>

  fetchAll(planId: ObjectId): THttpResponse<{ trades: ITrade[] }>

  delete(tradeId: ObjectId): THttpResponse<{ trade: ITrade }>
}
