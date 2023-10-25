import ReferralService from '../../../modules/referral/referral.service'
import { IReferralObject } from '../referral.interface'
import { referralA, referralAObj } from './referral.payoad'

export const createReferralMock = jest
  .spyOn(ReferralService.prototype, 'create')
  .mockResolvedValue(referralAObj)

export const calcAmountEarnReferralMock = jest
  .spyOn(ReferralService.prototype, '_calcAmountEarn')
  .mockResolvedValue({
    earn: referralA.amount,
    rate: referralA.rate,
  })
