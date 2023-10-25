import { InvestmentStatus } from '../../../modules/investment/investment.enum'
import {
  planA,
  planA_id,
  planB,
  planB_id,
  planC,
  planC_id,
} from './../../plan/__test__/plan.payload'
import { userA_id, userB_id, userC_id } from '../../user/__test__/user.payload'
import { UserAccount, UserEnvironment } from '../../user/user.enum'
import { IInvestmentObject } from '../investment.interface'
import { Types } from 'mongoose'

export const investmentA_id = new Types.ObjectId('1235de5d5b1f5b3a5c1b539a')
// @ts-ignore
export const investmentA: IInvestmentObject = {
  plan: planA_id,
  user: userA_id,
  gas: planA.gas,
  status: InvestmentStatus.RUNNING,
  amount: 100,
  balance: 200,
  account: UserAccount.MAIN_BALANCE,
  environment: UserEnvironment.LIVE,
  tradeStartTime: undefined,
  manualMode: false,
  minRunTime: planA.duration * 24 * 60 * 60 * 1000,
  tradeStatus: undefined,
}

export const investmentB_id = new Types.ObjectId('1235de5d5b1f5b3a5c1b539b')
// @ts-ignore
export const investmentB: IInvestmentObject = {
  plan: planB_id,
  user: userB_id,
  gas: planB.gas,
  status: InvestmentStatus.RUNNING,
  amount: 200,
  balance: 400,
  account: UserAccount.MAIN_BALANCE,
  environment: UserEnvironment.LIVE,
  tradeStartTime: undefined,
  manualMode: false,
  minRunTime: planB.duration * 24 * 60 * 60 * 1000,
  tradeStatus: undefined,
}

export const investmentC_id = new Types.ObjectId('1235de5d5b1f5b3a5c1b539c')
// @ts-ignore
export const investmentC: IInvestmentObject = {
  plan: planC_id,
  user: userC_id,
  gas: planC.gas,
  status: InvestmentStatus.RUNNING,
  amount: 300,
  balance: 600,
  account: UserAccount.MAIN_BALANCE,
  environment: UserEnvironment.LIVE,
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
