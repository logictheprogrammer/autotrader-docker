import type { AssetType } from '../asset/asset.enum'
import type { IPlan } from '../plan/plan.interface'
import type { UserAccount } from '../user/user.enum'
import type { InvestmentStatus } from './investment.enum'

export interface IInvestment {
  __v: number
  _id: string
  currency: string
  updatedAt: string
  createdAt: string
  planObject: IPlan
  user: {
    _id: string
    username: string
    isDeleted: boolean
  }
  minProfit: number
  maxProfit: number
  duration: number
  gas: number
  description: string
  assetType: AssetType
  assets: string[]
  status: InvestmentStatus
  dailyTrades: number
  amount: number
  balance: number
  dateSuspended?: string
  account: UserAccount
  environment: string
}

export interface ICreateInvestment {
  planId: string
  amount: number
  account: UserAccount
}
