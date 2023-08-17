import { ITrade } from '../../../modules/trade/trade.interface'
import { TradeStatus } from '../../trade/trade.enum'
import { request } from '../../../test'
import { userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { tradeService } from '../../../setup'
import tradeModel from '../trade.model'
import { tradeA } from './trade.payload'
import { Types } from 'mongoose'
import investmentModel from '../../investment/investment.model'
import { investmentA } from '../../investment/__test__/investment.payload'
import pairModel from '../../pair/pair.model'
import { pairA } from '../../pair/__test__/pair.payload'
import AppRepository from '../../app/app.repository'
import { IUser } from '../../user/user.interface'
import { IPair } from '../../pair/pair.interface'
import { IInvestment } from '../../investment/investment.interface'

const userRepository = new AppRepository<IUser>(userModel)
const pairRepository = new AppRepository<IPair>(pairModel)
const tradeRepository = new AppRepository<ITrade>(tradeModel)
const investmentRepository = new AppRepository<IInvestment>(investmentModel)

describe('trade', () => {
  describe('_createTransaction', () => {
    it('should return a trade transaction instance', async () => {
      request
      const user = await userRepository.create(userA).save()
      const investment = await investmentRepository.create(investmentA).save()
      const pair = await pairRepository.create(pairA).save()

      const tradeInstance = await tradeService._createTransaction(
        userRepository.toObject(user),
        investmentRepository.toObject(investment),
        pairRepository.toObject(pair),
        tradeA.move,
        tradeA.stake,
        tradeA.outcome,
        tradeA.stake,
        tradeA.percentage,
        tradeA.investmentPercentage,
        tradeA.environment,
        tradeA.manualMode
      )

      expect(tradeInstance.object.outcome).toBe(tradeA.outcome)
      expect(tradeInstance.object.user.toString()).toEqual(user._id.toString())
      expect(tradeInstance.object.investment.toString()).toBe(
        investment._id.toString()
      )
      expect(tradeInstance.object.pair.toString()).toBe(pair._id.toString())

      expect(tradeInstance.instance.onFailed).toContain(
        `Delete the trade with an id of (${
          tradeInstance.instance.model.collectUnsaved()._id
        })`
      )
    })
  })
  describe('_updateStatusTransaction', () => {
    describe('given trade id those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const trade = await tradeRepository.create(tradeA).save()

        expect(trade.status).toBe(TradeStatus.WAITING)

        await expect(
          tradeService._updateStatusTransaction(
            new Types.ObjectId(),
            TradeStatus.RUNNING
          )
        ).rejects.toThrow('Trade not found')
      })
    })
    describe('given the status has already been settle', () => {
      it('should throw a 400 error', async () => {
        request
        const trade = await tradeRepository
          .create({
            ...tradeA,
            status: TradeStatus.SETTLED,
          })
          .save()

        expect(trade.status).toBe(TradeStatus.SETTLED)

        await expect(
          tradeService._updateStatusTransaction(trade._id, TradeStatus.ON_HOLD)
        ).rejects.toThrow('This trade has already been settled')
      })
    })
    describe('given trade was on hold', () => {
      it('should return a trade transaction instance with on hold status', async () => {
        request
        const trade = await tradeRepository.create(tradeA).save()

        expect(trade.status).toBe(TradeStatus.WAITING)

        const tradeInstance = await tradeService._updateStatusTransaction(
          trade._id,
          TradeStatus.ON_HOLD
        )

        expect(tradeInstance.object.status).toBe(TradeStatus.ON_HOLD)

        expect(tradeInstance.instance.onFailed).toContain(
          `Set the status of the trade with an id of (${
            tradeInstance.instance.model.collectUnsaved()._id
          }) to (${TradeStatus.WAITING})`
        )
      })
    })
  })
})
