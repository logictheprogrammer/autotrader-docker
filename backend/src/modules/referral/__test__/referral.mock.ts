import { referralService } from '../../../setup'
import { referralA, referralAObj } from './referral.payoad'

export const createReferralMock = jest
  .spyOn(referralService, 'create')
  .mockResolvedValue(referralAObj)

export const calcAmountEarnReferralMock = jest
  .spyOn(referralService, '_calcAmountEarn')
  .mockResolvedValue({
    earn: referralA.amount,
    rate: referralA.rate,
  })
