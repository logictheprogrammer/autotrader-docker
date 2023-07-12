import { InvestmentStatus } from '../../../modules/investment/investment.enum'
import {
  planA,
  planA_id,
  planB,
  planB_id,
  planC,
  planC_id,
} from './../../plan/__test__/plan.payload'
import {
  userA,
  userA_id,
  userB,
  userB_id,
  userC,
  userC_id,
} from '../../user/__test__/user.payload'
import { UserAccount, UserEnvironment } from '../../user/user.enum'
import { IInvestmentObject } from '../investment.interface'
import { Types } from 'mongoose'

export const investmentA_id = new Types.ObjectId('1235de5d5b1f5b3a5c1b539a')
// @ts-ignore
export const investmentA: IInvestmentObject = {
  plan: planA_id,
  planObject: planA,
  user: userA_id,
  userObject: userA,
  icon: planA.icon,
  name: planA.name,
  engine: planA.engine,
  minProfit: planA.minProfit,
  maxProfit: planA.maxProfit,
  duration: planA.duration * 1000 * 60 * 60 * 24,
  gas: planA.gas,
  description: planA.description,
  assetType: planA.assetType,
  assets: planA.assets,
  status: InvestmentStatus.RUNNING,
  dailyTrades: planA.dailyTrades,
  amount: 100,
  balance: 200,
  account: UserAccount.MAIN_BALANCE,
  environment: UserEnvironment.LIVE,
}

export const investmentB_id = new Types.ObjectId('1235de5d5b1f5b3a5c1b539b')
// @ts-ignore
export const investmentB: IInvestmentObject = {
  plan: planB_id,
  planObject: planB,
  user: userB_id,
  userObject: userB,
  icon: planB.icon,
  name: planB.name,
  engine: planB.engine,
  minProfit: planB.minProfit,
  maxProfit: planB.maxProfit,
  duration: planB.duration * 1000 * 60 * 60 * 24,
  gas: planB.gas,
  description: planB.description,
  assetType: planB.assetType,
  assets: planB.assets,
  status: InvestmentStatus.RUNNING,
  dailyTrades: planB.dailyTrades,
  amount: 200,
  balance: 400,
  account: UserAccount.MAIN_BALANCE,
  environment: UserEnvironment.LIVE,
}

export const investmentC_id = new Types.ObjectId('1235de5d5b1f5b3a5c1b539c')
// @ts-ignore
export const investmentC: IInvestmentObject = {
  plan: planC_id,
  planObject: planC,
  user: userC_id,
  userObject: userC,
  icon: planC.icon,
  name: planC.name,
  engine: planC.engine,
  minProfit: planC.minProfit,
  maxProfit: planC.maxProfit,
  duration: planC.duration * 1000 * 60 * 60 * 24,
  gas: planC.gas,
  description: planC.description,
  assetType: planC.assetType,
  assets: planC.assets,
  status: InvestmentStatus.RUNNING,
  dailyTrades: planC.dailyTrades,
  amount: 300,
  balance: 600,
  account: UserAccount.MAIN_BALANCE,
  environment: UserEnvironment.LIVE,
}

// @ts-ignore
export const investmentModelReturn: IInvestment = {
  save: jest.fn(),
  _id: 'investment id',
  // @ts-ignore
  collection: {
    name: 'investment',
  },
}

// @ts-ignore
export const investmentAObj: IInvestmentObject = {
  ...investmentA,
  // @ts-ignore
  _id: investmentA_id,
}

// @ts-ignore
export const investmentBObj: IInvestmentObject = {
  ...investmentB,
  // @ts-ignore
  _id: investmentB_id,
}

export const investmentInstance = {
  model: investmentModelReturn,
  onFailed: 'delete investment',
  async callback() {},
}
