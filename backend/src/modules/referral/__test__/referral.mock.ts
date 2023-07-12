import ReferralService from '../../../modules/referral/referral.service'
import { IReferralObject } from '../referral.interface'
import {
  referralA,
  referralAObj,
  referralA_id,
  referralInstance,
} from './referral.payoad'

export const createTransactionReferralMock = jest
  .spyOn(ReferralService.prototype, '_createTransaction')
  .mockResolvedValue({
    object: referralAObj,
    instance: referralInstance,
  })

export const calcAmountEarnReferralMock = jest
  .spyOn(ReferralService.prototype, '_calcAmountEarn')
  .mockResolvedValue({
    earn: referralA.amount,
    rate: referralA.rate,
  })
