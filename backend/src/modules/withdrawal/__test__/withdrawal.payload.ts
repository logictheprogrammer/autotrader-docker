import { IWithdrawal } from '../../../modules/withdrawal/withdrawal.interface'
import {
  withdrawalMethodA_id,
  withdrawalMethodB,
  withdrawalMethodB_id,
  withdrawalMethodC,
  withdrawalMethodC_id,
} from './../../withdrawalMethod/__test__/withdrawalMethod.payload'
import { withdrawalMethodA } from '../../withdrawalMethod/__test__/withdrawalMethod.payload'
import {
  userA,
  userA_id,
  userB,
  userB_id,
  userC,
  userC_id,
} from '../../user/__test__/user.payload'
import { WithdrawalStatus } from '../withdrawal.enum'
import { UserAccount } from '../../user/user.enum'
import { Types } from 'mongoose'

export const withdrawalA_id = new Types.ObjectId('1145de5d5b1f5b3a5c1b539a')

export const withdrawalA = {
  withdrawalMethod: withdrawalMethodA_id,
  withdrawalMethodObject: withdrawalMethodA,
  user: userA_id,
  userObject: userA,
  account: UserAccount.MAIN_BALANCE,
  address: '--updated wallet address--',
  amount: 1000,
  fee: withdrawalMethodA.fee,
  status: WithdrawalStatus.PENDING,
}

export const withdrawalB_id = new Types.ObjectId('1145de5d5b1f5b3a5c1b539b')

export const withdrawalB = {
  withdrawalMethod: withdrawalMethodB_id,
  withdrawalMethodObject: withdrawalMethodB,
  user: userB_id,
  userObject: userB,
  account: UserAccount.MAIN_BALANCE,
  address: '--updated wallet address--',
  amount: 1500,
  fee: withdrawalMethodB.fee,
  status: WithdrawalStatus.PENDING,
}

export const withdrawalC_id = new Types.ObjectId('1145de5d5b1f5b3a5c1b539c')

export const withdrawalC = {
  withdrawalMethod: withdrawalMethodC_id,
  withdrawalMethodObject: withdrawalMethodC,
  user: userC_id,
  userObject: userC,
  account: UserAccount.MAIN_BALANCE,
  address: '--updated wallet address--',
  amount: 2000,
  fee: withdrawalMethodC.fee,
  status: WithdrawalStatus.PENDING,
}

// @ts-ignore
export const withdrawalModelReturn: IWithdrawal = {
  save: jest.fn(),
  toObject: jest.fn().mockReturnValue({
    _id: 'withdrawal id',
    // @ts-ignore
    collection: {
      name: 'withdrawal',
    },
  }),
  _id: 'withdrawal id',
  // @ts-ignore
  collection: {
    name: 'withdrawal',
  },
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

export const withdrawalInstance = {
  model: withdrawalModelReturn,
  onFailed: 'delete withdrawal',
  async callback() {},
}
