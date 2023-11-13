import { request } from '../../../test'
import { userAInput, userBInput } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { referralService, referralSettingsService } from '../../../setup'
import { ReferralTypes } from '../referral.enum'
import Helpers from '../../../utils/helpers'

describe('referral', () => {
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(referralService)
      expect(methods).toEqual([
        'referralModel',
        'findAll',
        '_calcAmountEarn',
        'create',
        'fetchAll',
        'earnings',
        'leaderboard',
        'delete',
        'count',
      ])
    })
  })
  describe('create', () => {
    describe('Given user was not referred', () => {
      it('should return undefined', async () => {
        request
        await referralSettingsService.create(10, 5, 15, 10, 10)
        const type = ReferralTypes.DEPOSIT
        const user = await userModel.create(userAInput)
        const amount = 1000

        expect(await referralService.create(type, user, amount)).toBe(undefined)
      })
    })

    describe('Given user was referred', () => {
      it('should create referral transaction in the database', async () => {
        request
        await referralSettingsService.create(10, 5, 15, 10, 10)
        const user1 = await userModel.create(userAInput)
        const type = ReferralTypes.DEPOSIT
        const user = await userModel.create({
          ...userBInput,
          referred: user1._id,
        })
        const amount = 1000

        const referral = await referralService.create(type, user, amount)

        const { earn, rate } = await referralService._calcAmountEarn(
          type,
          amount
        )

        expect(referral?.amount).toBe(earn)
        expect(referral?.rate).toBe(rate)
        expect(referral?.type).toBe(type)
        expect(referral?.referrer._id.toString()).toBe(user1._id.toString())
        expect(referral?.user._id.toString()).toBe(user._id.toString())
      })
    })
  })
})
