import { InvestmentStatus } from '@/modules/investment/investment.enum'
import { IPlan } from '@/modules/plan/plan.interface'
import { IUser } from '@/modules/user/user.interface'
import { UserAccount, UserEnvironment } from '@/modules/user/user.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'
import { AssetType } from '../asset/asset.enum'
import { IAsset } from '../asset/asset.interface'

export interface IInvestmentObject extends baseObjectInterface {
  user: IUser['_id']
  plan: IPlan['_id']
  assetType: AssetType
  assets: IAsset['_id'][]
  status: InvestmentStatus
  amount: number
  balance: number
  account: UserAccount
  environment: UserEnvironment
  expectedRunTime: number
  runTime: number
  resumeTime: Date
}

// @ts-ignore
export interface IInvestment extends baseModelInterface, IInvestmentObject {}

export interface IInvestmentService {
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
}
