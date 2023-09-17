import { IDeposit } from '../../../modules/deposit/deposit.interface'
import {
  depositMethodA_id,
  depositMethodB,
  depositMethodB_id,
  depositMethodC,
  depositMethodC_id,
} from './../../depositMethod/__test__/depositMethod.payload'
import { depositMethodA } from '../../depositMethod/__test__/depositMethod.payload'
import {
  userA,
  userA_id,
  userB,
  userB_id,
  userC,
  userC_id,
} from '../../user/__test__/user.payload'
import { DepositStatus } from '../deposit.enum'
import { Types } from 'mongoose'

export const depositA_id = new Types.ObjectId('1145de5d5b1f5b3a5c1b539a')

export const depositA = {
  depositMethod: depositMethodA_id,
  depositMethodObject: depositMethodA,
  user: userA_id,
  userObject: userA,
  amount: 1000,
  fee: depositMethodA.fee,
  status: DepositStatus.PENDING,
}

export const depositB_id = new Types.ObjectId('1145de5d5b1f5b3a5c1b539b')

export const depositB = {
  depositMethod: depositMethodB_id,
  depositMethodObject: depositMethodB,
  user: userB_id,
  userObject: userB,
  amount: 1500,
  fee: depositMethodB.fee,
  status: DepositStatus.PENDING,
}

export const depositC_id = new Types.ObjectId('1145de5d5b1f5b3a5c1b539c')

export const depositC = {
  depositMethod: depositMethodC_id,
  depositMethodObject: depositMethodC,
  user: userC_id,
  userObject: userC,
  amount: 2000,
  fee: depositMethodC.fee,
  status: DepositStatus.PENDING,
}

const id1 = new Types.ObjectId()

// @ts-ignore
export const depositModelReturn: IDeposit = {
  save: jest.fn(),
  toObject: jest.fn().mockReturnValue({
    _id: id1,
    // @ts-ignore
    collection: {
      name: 'deposit',
    },
  }),
  _id: id1,
  // @ts-ignore
  collection: {
    name: 'deposit',
  },
}

// @ts-ignore
export const depositAObj: IDepositObject = {
  ...depositA,
  // @ts-ignore
  _id: depositA_id,
}

// @ts-ignore
export const depositBObj: IDepositObject = {
  ...depositB,
  // @ts-ignore
  _id: depositB_id,
}
