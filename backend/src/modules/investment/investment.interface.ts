import { InvestmentStatus } from '@/modules/investment/investment.enum'
import { IPlan, IPlanObject } from '@/modules/plan/plan.interface'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { UserAccount, UserEnvironment } from '@/modules/user/user.enum'
import { AssetType } from '@/modules/asset/asset.enum'
import { TUpdateInvestmentStatus } from './investment.type'
import { TradeStatus } from '../trade/trade.enum'
import { ITrade, ITradeObject } from '../trade/trade.interface'
import { Document, ObjectId, Types } from 'mongoose'

export interface IInvestmentObject extends IAppObject {
  plan: IPlan['_id']
  planObject: IPlanObject
  user: IUser['_id']
  userObject: IUserObject
  timeLeft: number
  gas: number
  status: InvestmentStatus
  tradeStatus?: TradeStatus
  amount: number
  balance: number
  tradeStart?: Date
  account: UserAccount
  environment: UserEnvironment
  manualMode: boolean
}

export interface IInvestment extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  plan: IPlan['_id']
  planObject: IPlanObject
  user: IUser['_id']
  userObject: IUserObject
  timeLeft: number
  gas: number
  status: InvestmentStatus
  tradeStatus?: TradeStatus
  amount: number
  balance: number
  tradeStart?: Date
  account: UserAccount
  environment: UserEnvironment
  manualMode: boolean
}

export interface IInvestmentService {
  _createTransaction(
    user: IUserObject,
    plan: IPlanObject,
    amount: number,
    account: UserAccount,
    environment: UserEnvironment
  ): TTransaction<IInvestmentObject, IInvestment>

  _updateStatusTransaction(
    investmentId: ObjectId | Types.ObjectId,
    status: InvestmentStatus
  ): TTransaction<IInvestmentObject, IInvestment>

  updateTradeDetailsTransaction(
    investmentId: ObjectId,
    trade: ITradeObject
  ): TTransaction<IInvestmentObject, IInvestment>

  create(
    planId: ObjectId,
    userId: ObjectId,
    amount: number,
    account: UserAccount,
    environment: UserEnvironment
  ): THttpResponse<{ investment: IInvestment }>

  fetchAll(
    all: boolean,
    environment: UserEnvironment,
    userId?: ObjectId
  ): THttpResponse<{ investments: IInvestment[] }>

  get(investmentId: ObjectId): Promise<IInvestmentObject>

  delete(investmentId: ObjectId): THttpResponse<{ investment: IInvestment }>

  updateStatus(
    investmentId: ObjectId,
    status: InvestmentStatus,
    sendNotice?: boolean
  ): Promise<{
    model: IInvestment
    instances: TUpdateInvestmentStatus
  }>

  forceFund(
    investmentId: ObjectId,
    amount: number
  ): THttpResponse<{ investment: IInvestment }>

  refill(
    investmentId: ObjectId,
    gas: number
  ): THttpResponse<{ investment: IInvestment }>
}
