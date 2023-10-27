import {
  withdrawalMethodA_id,
  withdrawalMethodB,
  withdrawalMethodB_id,
  withdrawalMethodC,
  withdrawalMethodC_id,
} from './../../withdrawalMethod/__test__/withdrawalMethod.payload'
import { withdrawalMethodA } from '../../withdrawalMethod/__test__/withdrawalMethod.payload'
import { userA_id, userB_id, userC_id } from '../../user/__test__/user.payload'
import { WithdrawalStatus } from '../withdrawal.enum'
import { UserAccount } from '../../user/user.enum'
import { Types } from 'mongoose'
import {
  currencyA_id,
  currencyB_id,
  currencyC_id,
} from '../../currency/__test__/currency.payload'

export const withdrawalA_id = new Types.ObjectId('1145de5d5b1f5b3a5c1b539a')

export const withdrawalA = {
  withdrawalMethod: withdrawalMethodA_id,
  currency: currencyA_id,
  user: userA_id,
  account: UserAccount.MAIN_BALANCE,
  address: '--updated wallet address--',
  amount: 1000,
  fee: withdrawalMethodA.fee,
  status: WithdrawalStatus.PENDING,
}

export const withdrawalB_id = new Types.ObjectId('1145de5d5b1f5b3a5c1b539b')

export const withdrawalB = {
  withdrawalMethod: withdrawalMethodB_id,
  currency: currencyB_id,
  user: userB_id,
  account: UserAccount.MAIN_BALANCE,
  address: '--updated wallet address--',
  amount: 1500,
  fee: withdrawalMethodB.fee,
  status: WithdrawalStatus.PENDING,
}

export const withdrawalC_id = new Types.ObjectId('1145de5d5b1f5b3a5c1b539c')

export const withdrawalC = {
  withdrawalMethod: withdrawalMethodC_id,
  currency: currencyC_id,
  user: userC_id,
  account: UserAccount.MAIN_BALANCE,
  address: '--updated wallet address--',
  amount: 2000,
  fee: withdrawalMethodC.fee,
  status: WithdrawalStatus.PENDING,
}

// @ts-ignore
export const withdrawalAObj: IWithdrawalObject = {
  ...withdrawalA,
  // @ts-ignore
  _id: withdrawalA_id,
}

// @ts-ignore
export const withdrawalBObj: IWithdrawalObject = {
  ...withdrawalB,
  // @ts-ignore
  _id: withdrawalB_id,
}
