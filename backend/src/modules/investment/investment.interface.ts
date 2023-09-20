import { InvestmentStatus } from '@/modules/investment/investment.enum'
import { IPlan, IPlanObject } from '@/modules/plan/plan.interface'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { UserAccount, UserEnvironment } from '@/modules/user/user.enum'
import { AssetType } from '@/modules/asset/asset.enum'
import { TUpdateInvestmentStatus } from './investment.type'
import { ForecastStatus } from '../forecast/forecast.enum'
import { IForecast, IForecastObject } from '../forecast/forecast.interface'
import { Document, ObjectId, Types } from 'mongoose'
import { INotification } from '../notification/notification.interface'
import { ITransaction } from '../transaction/transaction.interface'
import { IReferral } from '../referral/referral.interface'
import { ITransactionInstance } from '../transactionManager/transactionManager.interface'
import { ITrade, ITradeObject } from '../trade/trade.interface'

export interface IInvestmentObject extends IAppObject {
  plan: IPlan['_id']
  planObject: IPlanObject
  user: IUser['_id']
  userObject: IUserObject
  minRunTime: number
  gas: number
  status: InvestmentStatus
  amount: number
  balance: number
  account: UserAccount
  environment: UserEnvironment
  manualMode: boolean
  currentTrade?: ITrade['_id']
  runTime: number
  tradeStatus?: ForecastStatus
  tradeTimeStamps: number[]
  tradeStartTime?: Date
}

export interface IInvestment extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  plan: IPlan['_id']
  planObject: IPlanObject
  user: IUser['_id']
  userObject: IUserObject
  minRunTime: number
  gas: number
  status: InvestmentStatus
  amount: number
  balance: number
  account: UserAccount
  environment: UserEnvironment
  manualMode: boolean
  runTime: number
  currentTrade?: ITrade['_id']
  tradeStatus?: ForecastStatus
  tradeTimeStamps: number[]
  tradeStartTime?: Date
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

  _fundTransaction(
    investmentId: ObjectId,
    amount: number
  ): TTransaction<IInvestmentObject, IInvestment>

  _updateTradeDetails(
    investmentId: ObjectId | Types.ObjectId,
    tradeObject: ITradeObject
  ): TTransaction<IInvestmentObject, IInvestment>

  updateTradeDetails(
    investmentId: ObjectId | Types.ObjectId,
    tradeObject: ITradeObject
  ): Promise<ITransactionInstance<IInvestment>>

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

  getAllAutoAwaiting(planId: ObjectId): Promise<IInvestmentObject[]>

  getAllAutoRunning(planId: ObjectId): Promise<IInvestmentObject[]>

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

  forceUpdateStatus(
    investmentId: ObjectId,
    status: InvestmentStatus
  ): THttpResponse<{ investment: IInvestment }>

  forceFund(
    investmentId: ObjectId,
    amount: number
  ): THttpResponse<{ investment: IInvestment }>

  refill(
    investmentId: ObjectId,
    gas: number
  ): THttpResponse<{ investment: IInvestment }>
}
