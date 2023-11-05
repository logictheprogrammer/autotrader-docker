import forecastModel from '../../../modules/forecast/forecast.model'
import { ForecastStatus } from '../../forecast/forecast.enum'
import { request } from '../../../test'
import { userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { tradeService } from '../../../setup'
import tradeModel from '../trade.model'
import { tradeA } from './trade.payload'
import investmentModel from '../../investment/investment.model'
import { investmentA } from '../../investment/__test__/investment.payload'
import pairModel from '../../pair/pair.model'
import { pairA } from '../../pair/__test__/pair.payload'
import { Types } from 'mongoose'
import { forecastA } from '../../forecast/__test__/forecast.payload'
import { updateInvestmentTradeDetailsMock } from '../../investment/__test__/investment.mock'

describe('trade', () => {
  describe('create', () => {
    it('should return a trade transaction instance', async () => {
      request
      const user = await userModel.create(userA)
      const investment = await investmentModel.create(investmentA)
      const forecast = await forecastModel.create(forecastA)

      const tradeObj = await tradeService.create(user._id, investment, forecast)

      const amount = investment.amount
      const stake = forecast.stakeRate * amount
      const profit = (forecast.percentageProfit / 100) * amount
      const outcome = stake + profit
      const percentage = (profit * 100) / stake

      expect(tradeObj.profit).toBe(profit)
      expect(tradeObj.stake).toBe(stake)
      expect(tradeObj.outcome).toBe(outcome)
      expect(tradeObj.percentage).toBe(percentage)
      expect(tradeObj.user._id).toEqual(user._id.toString())
      expect(tradeObj.investment._id).toEqual(investment._id.toString())
      expect(tradeObj.forecast._id).toEqual(forecast._id.toString())

      expect(updateInvestmentTradeDetailsMock).toHaveBeenCalledTimes(1)
      expect(updateInvestmentTradeDetailsMock).toHaveBeenCalledWith(
        { _id: investment._id },
        expect.objectContaining({ _id: tradeObj._id })
      )
    })
  })
  describe('updateStatus', () => {
    describe('given trade id those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const investment = await investmentModel.create(investmentA)
        const forecast = await forecastModel.create(forecastA)

        await expect(
          tradeService.updateStatus(
            { _id: new Types.ObjectId() },
            ForecastStatus.RUNNING
          )
        ).rejects.toThrow('Trade not found')
      })
    })
    describe('given the status has already been settle', () => {
      it('should throw a 400 error', async () => {
        request
        const trade = await tradeModel.create({
          ...tradeA,
          status: ForecastStatus.SETTLED,
        })

        expect(trade.status).toBe(ForecastStatus.SETTLED)

        await expect(
          tradeService.updateStatus({ _id: trade._id }, ForecastStatus.ON_HOLD)
        ).rejects.toThrow('This trade has already been settled')
      })
    })
    describe('given trade was on hold', () => {
      it('should return a trade transaction instance with on hold status', async () => {
        request
        const trade = await tradeModel.create(tradeA)

        expect(trade.status).toBe(ForecastStatus.PREPARING)

        const tradeObj = await tradeService.updateStatus(
          { _id: trade._id },
          ForecastStatus.ON_HOLD
        )

        expect(tradeObj.object.status).toBe(ForecastStatus.ON_HOLD)

        expect(tradeObj.instance.onFailed).toContain(
          `Set the status of the trade with an id of (${tradeObj.instance.model._id}) to (${ForecastStatus.PREPARING})`
        )
      })
    })
  })
})
