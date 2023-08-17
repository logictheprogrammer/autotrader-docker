import { InvestmentStatus } from '../../investment/investment.enum'
import { request } from '../../../test'
import { userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { investmentService } from '../../../setup'
import investmentModel from '../investment.model'
import { investmentA } from './investment.payload'
import planModel from '../../plan/plan.model'
import { planA } from '../../plan/__test__/plan.payload'
import { UserAccount, UserEnvironment } from '../../user/user.enum'
import AppRepository from '../../app/app.repository'
import { IInvestment } from '../investment.interface'
import { IUser } from '../../user/user.interface'
import { IPlan } from '../../plan/plan.interface'
import AppObjectId from '../../app/app.objectId'

const userRepository = new AppRepository<IUser>(userModel)
const planRepository = new AppRepository<IPlan>(planModel)
const investmentRepository = new AppRepository<IInvestment>(investmentModel)

describe('investment', () => {
  describe('_createTransaction', () => {
    it('should return a investment transaction instance', async () => {
      request
      const user = await userRepository.create(userA).save()
      const plan = await planRepository.create(planA).save()
      const amount = 100
      const account = UserAccount.MAIN_BALANCE
      const environment = UserEnvironment.LIVE

      const investmentInstance = await investmentService._createTransaction(
        userRepository.toObject(user),
        planRepository.toObject(plan),
        amount,
        account,
        environment
      )

      expect(investmentInstance.object.amount).toBe(amount)
      expect(investmentInstance.object.user.toString()).toEqual(
        user._id.toString()
      )
      expect(investmentInstance.object.plan.toString()).toBe(
        plan._id.toString()
      )
      expect(investmentInstance.object.account).toBe(account)

      expect(investmentInstance.instance.onFailed).toContain(
        `Delete the investment with an id of (${
          investmentInstance.instance.model.collectUnsaved()._id
        })`
      )
    })
  })
  describe('_fundTransaction', () => {
    describe('given investment id those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const amount = 1000

        await expect(
          investmentService._fundTransaction(new AppObjectId(), amount)
        ).rejects.toThrow('Investment plan not found')
      })
    })

    describe('on success', () => {
      it('should a funded investment transaction instance', async () => {
        request
        const investment = await investmentRepository.create(investmentA).save()
        const amount = 1000

        const result = await investmentService._fundTransaction(
          investment._id,
          amount
        )

        expect(result.object.balance).toBe(investment.balance + amount)
      })
    })
  })
  describe('_updateStatusTransaction', () => {
    describe('given investment id those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const investment = await investmentRepository
          .create({
            ...investmentA,
            status: InvestmentStatus.SUSPENDED,
          })
          .save()

        expect(investment.status).toBe(InvestmentStatus.SUSPENDED)

        await expect(
          investmentService._updateStatusTransaction(
            new AppObjectId(),
            InvestmentStatus.RUNNING
          )
        ).rejects.toThrow('Investment plan not found')
      })
    })
    describe('given the status has already been settle', () => {
      it('should throw a 400 error', async () => {
        request
        const investment = await investmentRepository
          .create({
            ...investmentA,
            status: InvestmentStatus.COMPLETED,
          })
          .save()

        expect(investment.status).toBe(InvestmentStatus.COMPLETED)

        await expect(
          investmentService._updateStatusTransaction(
            investment._id,
            InvestmentStatus.SUSPENDED
          )
        ).rejects.toThrow('Investment plan has already been settled')
      })
    })
    describe('given investment was suspended', () => {
      it('should return a investment transaction instance with suspended status', async () => {
        request
        const investment = await investmentRepository.create(investmentA).save()

        expect(investment.status).toBe(InvestmentStatus.RUNNING)

        const investmentInstance =
          await investmentService._updateStatusTransaction(
            investment._id,
            InvestmentStatus.SUSPENDED
          )

        expect(investmentInstance.object.status).toBe(
          InvestmentStatus.SUSPENDED
        )

        expect(investmentInstance.instance.onFailed).toContain(
          `Set the status of the investment with an id of (${
            investmentInstance.instance.model.collectUnsaved()._id
          }) to (${InvestmentStatus.RUNNING})`
        )
      })
    })
  })
})
