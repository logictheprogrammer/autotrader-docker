import { IBaseObject } from '@/util/interface'
import type { IPlan } from '../plan/plan.interface'
import type { UserAccount, UserEnvironment } from '../user/user.enum'
import type { InvestmentStatus } from './investment.enum'
import { IUser } from '../user/user.interface'
import { AssetType } from '../asset/asset.enum'
import { IAsset } from '../asset/asset.interface'

export interface IInvestment extends IBaseObject {
  plan?: IPlan
  user?: IUser
  assetType: AssetType
  assets: IAsset[]
  status: InvestmentStatus
  amount: number
  balance: number
  extraProfit: number
  account: UserAccount
  environment: UserEnvironment
  expectedRunTime: number
  runTime: number
  resumeTime: Date
}

export interface ICreateInvestment {
  planId: string
  amount: number
  account: UserAccount
}
