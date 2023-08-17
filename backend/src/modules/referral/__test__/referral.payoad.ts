import referralModel from '../../../modules/referral/referral.model'
import { ReferralTypes } from '../../../modules/referral/referral.enum'
import {
  IReferral,
  IReferralObject,
} from '../../../modules/referral/referral.interface'
import AppRepository from '../../app/app.repository'
import { depositA } from '../../deposit/__test__/deposit.payload'
import {
  userA,
  userA_id,
  userB,
  userB_id,
} from '../../user/__test__/user.payload'

const referralRepository = new AppRepository<IReferral>(referralModel)

// @ts-ignore
export const referralModelReturn: IReferral = {
  save: jest.fn(),
  _id: 'referral id',
  // @ts-ignore
  collection: {
    name: 'referral',
  },
}

export const referralA_id = '2245de5d5b1f5b3a5c1b539a'

export const referralA = {
  rate: 10,
  type: ReferralTypes.DEPOSIT,
  user: userB_id,
  userObject: userB,
  referrer: userA_id,
  referrerObject: userA,
  amount: depositA.amount * 0.1,
}

// @ts-ignore
export const referralAObj: IReferralObject = {
  ...referralA,
  // @ts-ignore
  _id: referralA_id,
}

export const referralInstance = {
  model: referralRepository.toClass(referralModelReturn),
  onFailed: 'delete referral',
  async callback() {},
}

export const referralInstanceOnFailed = {
  model: referralRepository.toClass(referralModelReturn),
  onFailed: 'delete referral',
  async callback() {
    throw new Error('onFailed Error')
  },
}
