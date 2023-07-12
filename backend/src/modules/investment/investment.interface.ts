import { Document } from 'mongoose'
import { InvestmentStatus } from '@/modules/investment/investment.enum'
import { IPlan, IPlanObject } from '@/modules/plan/plan.interface'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { IServiceObject } from '@/modules/service/service.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { UserAccount, UserEnvironment } from '@/modules/user/user.enum'
import { Types } from 'mongoose'
import { AssetType } from '@/modules/asset/asset.enum'
import { ITransactionInstance } from '../transactionManager/transactionManager.interface'
import { INotification } from '../notification/notification.interface'
import { IReferral } from '../referral/referral.interface'
import { ITransaction } from '../transaction/transaction.interface'
import { TUpdateInvestmentStatus } from './investment.type'

export interface IInvestmentObject extends IServiceObject {
  plan: IPlan['_id']
  planObject: IPlanObject
  user: IUser['_id']
  userObject: IUserObject
  icon: string
  name: string
  engine: string
  minProfit: number
  maxProfit: number
  duration: number
  gas: number
  description: string
  assetType: AssetType
  assets: any[]
  status: InvestmentStatus
  dailyTrades: number
  amount: number
  balance: number
  dateSuspended?: Date
  account: UserAccount
  environment: UserEnvironment
}

export interface IInvestment extends Document {
  plan: IPlan['_id']
  planObject: IPlanObject
  user: IUser['_id']
  userObject: IUserObject
  icon: string
  name: string
  engine: string
  minProfit: number
  maxProfit: number
  duration: number
  gas: number
  description: string
  assetType: AssetType
  assets: any[]
  status: InvestmentStatus
  dailyTrades: number
  amount: number
  balance: number
  dateSuspended?: Date
  account: UserAccount
  environment: UserEnvironment
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
    investmentId: Types.ObjectId,
    status: InvestmentStatus
  ): TTransaction<IInvestmentObject, IInvestment>

  _fundTransaction(
    investmentId: Types.ObjectId,
    amount: number
  ): TTransaction<IInvestmentObject, IInvestment>

  create(
    planId: Types.ObjectId,
    userId: Types.ObjectId,
    amount: number,
    account: UserAccount,
    environment: UserEnvironment
  ): THttpResponse<{ investment: IInvestment }>

  fetchAll(
    all: boolean,
    environment: UserEnvironment,
    userId?: Types.ObjectId
  ): THttpResponse<{ investments: IInvestment[] }>

  get(investmentId: Types.ObjectId): Promise<IInvestmentObject>

  delete(
    investmentId: Types.ObjectId
  ): THttpResponse<{ investment: IInvestment }>

  updateStatus(
    investmentId: Types.ObjectId,
    status: InvestmentStatus,
    sendNotice?: boolean
  ): Promise<{ model: IInvestment; instances: TUpdateInvestmentStatus }>

  forceUpdateStatus(
    investmentId: Types.ObjectId,
    status: InvestmentStatus
  ): THttpResponse<{ investment: IInvestment }>

  fund(
    investmentId: Types.ObjectId,
    amount: number
  ): TTransaction<IInvestmentObject, IInvestment>

  forceFund(
    investmentId: Types.ObjectId,
    amount: number
  ): THttpResponse<{ investment: IInvestment }>

  refill(
    investmentId: Types.ObjectId,
    gas: number
  ): THttpResponse<{ investment: IInvestment }>
}
