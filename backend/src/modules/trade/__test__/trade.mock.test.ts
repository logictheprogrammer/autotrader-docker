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
import { UserAccount, UserEnvironment } from '../../user/user.enum'
import pairModel from '../../pair/pair.model'
import { pairA } from '../../pair/__test__/pair.payload'

describe('trade', () => {
  describe('_createTransaction', () => {
    it('should return a trade transaction instance', async () => {
      request
      const user = await userModel.create(userA)
      const investment = await investmentModel.create(investmentA)
      const pair = await pairModel.create(pairA)

      const tradeInstance = await tradeService._createTransaction(
        user.toObject(),
        investment.toObject(),
        pair.toObject(),
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
        `Delete the trade with an id of (${tradeInstance.instance.model._id})`
      )
    })
  })
  describe('_updateStatusTransaction', () => {
    describe('given trade id those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const trade = await tradeModel.create(tradeA)

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
        const trade = await tradeModel.create({
          ...tradeA,
          status: TradeStatus.SETTLED,
        })

        expect(trade.status).toBe(TradeStatus.SETTLED)

        await expect(
          tradeService._updateStatusTransaction(trade._id, TradeStatus.ON_HOLD)
        ).rejects.toThrow('This trade has already been settled')
      })
    })
    describe('given trade was on hold', () => {
      it('should return a trade transaction instance with on hold status', async () => {
        request
        const trade = await tradeModel.create(tradeA)

        expect(trade.status).toBe(TradeStatus.WAITING)

        const tradeInstance = await tradeService._updateStatusTransaction(
          trade._id,
          TradeStatus.ON_HOLD
        )

        expect(tradeInstance.object.status).toBe(TradeStatus.ON_HOLD)

        expect(tradeInstance.instance.onFailed).toContain(
          `Set the status of the trade with an id of (${tradeInstance.instance.model._id}) to (${TradeStatus.WAITING})`
        )
      })
    })
  })
})
