import { InvestmentStatus } from '../../investment/investment.enum'
import { request } from '../../../test'
import { userA, userAInput, userA_id } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { investmentService } from '../../../setup'
import investmentModel from '../investment.model'
import { investmentA } from './investment.payload'
import planModel from '../../plan/plan.model'
import { planA } from '../../plan/__test__/plan.payload'
import { UserAccount, UserEnvironment } from '../../user/user.enum'
import { Types } from 'mongoose'

describe('investment', () => {
  describe('create', () => {
    it('should return a investment', async () => {
      request
      const user = await userModel.create(userAInput)
      const plan = await planModel.create(planA)
      const amount = 100
      const account = UserAccount.MAIN_BALANCE
      const environment = UserEnvironment.LIVE

      const investmentObj = await investmentService.create(
        plan._id,
        user._id,
        amount,
        account,
        environment
      )

      expect(investmentObj.amount).toBe(amount)
      expect(investmentObj.user._id.toString()).toEqual(user._id.toString())
      expect(investmentObj.plan._id.toString()).toBe(plan._id.toString())
      expect(investmentObj.account).toBe(account)
    })
  })
  describe('fund', () => {
    describe('given investment id those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const amount = 1000

        try {
          await investmentService.fund({ _id: new Types.ObjectId() }, amount)
        } catch (error: any) {
          expect(error.error.message).toBe('Investment not found')
        }
      })
    })

    describe('on success', () => {
      it('should a funded investment transaction instance', async () => {
        request
        const investment = await investmentModel.create(investmentA)
        const amount = 1000

        const result = await investmentService.fund(
          { _id: investment._id },
          amount
        )

        expect(result.balance).toBe(investment.balance + amount)
      })
    })
  })
  describe('updateStatus', () => {
    describe('given investment id those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const investment = await investmentModel.create({
          ...investmentA,
          status: InvestmentStatus.SUSPENDED,
        })

        expect(investment.status).toBe(InvestmentStatus.SUSPENDED)

        try {
          await investmentService.updateStatus(
            { _id: new Types.ObjectId() },
            InvestmentStatus.RUNNING
          )
        } catch (error: any) {
          expect(error.error.message).toBe('Investment not found')
        }
      })
    })
    describe('given the status has already been settle', () => {
      it('should throw a 400 error', async () => {
        request
        const investment = await investmentModel.create({
          ...investmentA,
          status: InvestmentStatus.COMPLETED,
        })

        expect(investment.status).toBe(InvestmentStatus.COMPLETED)

        try {
          await investmentService.updateStatus(
            { _id: investment._id },
            InvestmentStatus.SUSPENDED
          )
        } catch (error: any) {
          expect(error.error.message).toBe(
            'Investment plan has already been settled'
          )
        }
      })
    })
    describe('given investment was suspended', () => {
      it('should return a investment transaction instance with suspended status', async () => {
        request

        await userModel.create({ ...userAInput, _id: userA_id })
        const investment = await investmentModel.create(investmentA)

        expect(investment.status).toBe(InvestmentStatus.RUNNING)

        const investmentObj = await investmentService.updateStatus(
          { _id: investment._id },
          InvestmentStatus.SUSPENDED
        )

        expect(investmentObj.status).toBe(InvestmentStatus.SUSPENDED)
      })
    })
  })
})