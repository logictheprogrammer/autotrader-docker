import { InvestmentStatus } from '@/modules/investment/investment.enum'
import { IPlan, IPlanObject } from '@/modules/plan/plan.interface'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { UserAccount, UserEnvironment } from '@/modules/user/user.enum'
import { AssetType } from '@/modules/asset/asset.enum'
import { TUpdateInvestmentStatus } from './investment.type'
import AppRepository from '../app/app.repository'
import AppDocument from '../app/app.document'
import AppObjectId from '../app/app.objectId'
import { TradeStatus } from '../trade/trade.enum'
import { ITrade, ITradeObject } from '../trade/trade.interface'

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

export interface IInvestment extends AppDocument {
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
    investmentId: AppObjectId,
    status: InvestmentStatus
  ): TTransaction<IInvestmentObject, IInvestment>

  updateTradeDetailsTransaction(
    investmentId: AppObjectId,
    trade: ITradeObject
  ): TTransaction<IInvestmentObject, IInvestment>

  create(
    planId: AppObjectId,
    userId: AppObjectId,
    amount: number,
    account: UserAccount,
    environment: UserEnvironment
  ): THttpResponse<{ investment: IInvestment }>

  fetchAll(
    all: boolean,
    environment: UserEnvironment,
    userId?: AppObjectId
  ): THttpResponse<{ investments: IInvestment[] }>

  get(investmentId: AppObjectId): Promise<IInvestmentObject>

  delete(investmentId: AppObjectId): THttpResponse<{ investment: IInvestment }>

  updateStatus(
    investmentId: AppObjectId,
    status: InvestmentStatus,
    sendNotice?: boolean
  ): Promise<{
    model: AppRepository<IInvestment>
    instances: TUpdateInvestmentStatus
  }>

  forceFund(
    investmentId: AppObjectId,
    amount: number
  ): THttpResponse<{ investment: IInvestment }>

  refill(
    investmentId: AppObjectId,
    gas: number
  ): THttpResponse<{ investment: IInvestment }>
}
