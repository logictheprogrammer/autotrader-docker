import { InvestmentStatus } from '@/modules/investment/investment.enum'
import { IPlan, IPlanObject } from '@/modules/plan/plan.interface'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { UserAccount, UserEnvironment } from '@/modules/user/user.enum'
import { ForecastStatus } from '../forecast/forecast.enum'
import { FilterQuery, ObjectId, Types } from 'mongoose'

import { ITrade, ITradeObject } from '../trade/trade.interface'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'
import { PlanMode } from '../plan/plan.enum'

export interface IInvestmentObject extends baseObjectInterface {
  plan: IPlan['_id']
  user: IUser['_id']
  minRunTime: number
  gas: number
  status: InvestmentStatus
  amount: number
  balance: number
  account: UserAccount
  environment: UserEnvironment
  mode: PlanMode
  currentTrade?: ITrade['_id']
  runTime: number
  tradeStatus?: ForecastStatus
  tradeTimeStamps: number[]
  tradeStartTime?: Date
}

// @ts-ignore
export interface IInvestment extends baseModelInterface, IInvestmentObject {}

export interface IInvestmentService {
  updateTradeDetails(
    filter: FilterQuery<IInvestment>,
    tradeObject: ITradeObject | null
  ): Promise<IInvestmentObject>

  create(
    planId: ObjectId,
    userId: ObjectId,
    amount: number,
    account: UserAccount,
    environment: UserEnvironment
  ): Promise<IInvestmentObject>

  fetchAll(filter: FilterQuery<IInvestment>): Promise<IInvestmentObject[]>

  fetch(filter: FilterQuery<IInvestment>): Promise<IInvestmentObject>

  count(filter: FilterQuery<IInvestment>): Promise<number>

  delete(filter: FilterQuery<IInvestment>): Promise<IInvestmentObject>

  updateStatus(
    filter: FilterQuery<IInvestment>,
    status: InvestmentStatus,
    sendNotice?: boolean
  ): Promise<IInvestmentObject>

  fund(
    filter: FilterQuery<IInvestment>,
    amount: number
  ): Promise<IInvestmentObject>

  refill(
    filter: FilterQuery<IInvestment>,
    gas: number
  ): Promise<IInvestmentObject>
}
