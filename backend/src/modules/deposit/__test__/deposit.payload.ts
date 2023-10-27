import {
  depositMethodA_id,
  depositMethodB,
  depositMethodB_id,
  depositMethodC,
  depositMethodC_id,
} from './../../depositMethod/__test__/depositMethod.payload'
import { depositMethodA } from '../../depositMethod/__test__/depositMethod.payload'
import { userA_id, userB_id, userC_id } from '../../user/__test__/user.payload'
import { DepositStatus } from '../deposit.enum'
import { Types } from 'mongoose'
import {
  currencyA_id,
  currencyB_id,
  currencyC_id,
} from '../../currency/__test__/currency.payload'

export const depositA_id = new Types.ObjectId('1145de5d5b1f5b3a5c1b539a')

export const depositA = {
  depositMethod: depositMethodA_id,
  user: userA_id,
  currency: currencyA_id,
  amount: 1000,
  fee: depositMethodA.fee,
  status: DepositStatus.PENDING,
}

export const depositB_id = new Types.ObjectId('1145de5d5b1f5b3a5c1b539b')

export const depositB = {
  depositMethod: depositMethodB_id,
  user: userB_id,
  currency: currencyB_id,
  amount: 1500,
  fee: depositMethodB.fee,
  status: DepositStatus.PENDING,
}

export const depositC_id = new Types.ObjectId('1145de5d5b1f5b3a5c1b539c')

export const depositC = {
  depositMethod: depositMethodC_id,
  user: userC_id,
  currency: currencyC_id,
  amount: 2000,
  fee: depositMethodC.fee,
  status: DepositStatus.PENDING,
}

const id1 = new Types.ObjectId()

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
