import { createNotificationMock } from './../../notification/__test__/notification.mock'
import { createTransactionMock } from './../../transaction/__test__/transaction.mock'
import forecastModel from '../../../modules/forecast/forecast.model'
import { ForecastMove, ForecastStatus } from '../../forecast/forecast.enum'
import { request } from '../../../test'
import { userAInput } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { tradeService } from '../../../setup'
import tradeModel from '../trade.model'
import investmentModel from '../../investment/investment.model'
import { investmentA } from '../../investment/__test__/investment.payload'
import { forecastA } from '../../forecast/__test__/forecast.payload'
import { updateInvestmentTradeDetailsMock } from '../../investment/__test__/investment.mock'
import { TransactionTitle } from '../../transaction/transaction.enum'
import {
  NotificationTitle,
  NotificationForWho,
} from '../../notification/notification.enum'

describe('trade', () => {
  describe('create', () => {
    it('should return a trade transaction instance', async () => {
      request
      const user = await userModel.create(userAInput)
      const investment = await investmentModel.create(investmentA)
      const forecast = await forecastModel.create(forecastA)

      const tradeObj = await tradeService.create(user._id, investment, forecast)

      const amount = investment.amount
      const stake = forecast.stakeRate * amount
      const profit = forecast.percentageProfit
        ? forecast.percentageProfit * amount
        : undefined
      const outcome = profit ? stake + profit : undefined
      const percentage = profit ? profit / stake : undefined

      expect(tradeObj.profit).toBe(profit)
      expect(tradeObj.stake).toBe(stake)
      expect(tradeObj.outcome).toBe(outcome)
      expect(tradeObj.percentage).toBe(percentage)
      expect(tradeObj.user._id.toString()).toEqual(user._id.toString())
      expect(tradeObj.investment._id.toString()).toEqual(
        investment._id.toString()
      )
      expect(tradeObj.forecast._id.toString()).toEqual(forecast._id.toString())

      const tradeCount = await tradeModel.count(tradeObj)

      expect(tradeCount).toBe(1)

      expect(updateInvestmentTradeDetailsMock).toHaveBeenCalledTimes(1)
      expect(updateInvestmentTradeDetailsMock).toHaveBeenCalledWith(
        { _id: investment._id },
        expect.objectContaining({ _id: tradeObj._id })
      )

      expect(createTransactionMock).toBeCalledTimes(1)
      expect(createTransactionMock).toBeCalledWith(
        expect.objectContaining({
          _id: user._id,
        }),
        TransactionTitle.TRADE_STAKE,
        expect.objectContaining({
          _id: tradeObj._id,
        }),
        stake,
        tradeObj.environment
      )

      expect(createNotificationMock).toHaveBeenCalledTimes(1)
      expect(createNotificationMock).toHaveBeenCalledWith(
        `Your ${investment.plan.name} investment plan now has a pending trade to be placed`,
        NotificationTitle.TRADE_STAKE,
        expect.objectContaining({ _id: tradeObj._id }),
        NotificationForWho.USER,
        tradeObj.environment,
        expect.objectContaining({ _id: user._id })
      )
    })
  })
  describe('update', () => {
    describe('given trade id those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const investment = await investmentModel.create(investmentA)
        const forecast = await forecastModel.create(forecastA)

        await expect(tradeService.update(investment, forecast)).rejects.toThrow(
          `The (${forecast.mode}) trade with a forecast of (${forecast._id}) and investment of (${investment._id}) could not be found`
        )
      })
    })
    describe('on success', () => {
      it('should a trade payload', async () => {
        request

        const user = await userModel.create(userAInput)
        const investment = await investmentModel.create(investmentA)
        const forecast = await forecastModel.create(forecastA)

        const oldTradeObj = await tradeService.create(
          user._id,
          investment,
          forecast
        )

        investment.currentTrade = oldTradeObj

        await investment.save()

        oldTradeObj.move = undefined
        oldTradeObj.closingPrice = undefined
        oldTradeObj.openingPrice = undefined

        const payload = {
          stakeRate: 0.15,
          percentageProfit: 3.5,
          move: ForecastMove.LONG,
          closingPrice: 105,
          openingPrice: 100,
        }

        forecast.stakeRate = payload.stakeRate
        forecast.percentageProfit = payload.percentageProfit
        forecast.move = payload.move
        forecast.closingPrice = payload.closingPrice
        forecast.openingPrice = payload.openingPrice

        await forecast.save()

        const amount = investment.amount
        const stake = forecast.stakeRate * amount
        const profit = forecast.percentageProfit * amount
        const outcome = stake + profit
        const percentage = profit / stake

        const result = await tradeService.update(investment, forecast)

        expect(result.profit).toBe(profit)
        expect(result.stake).toBe(stake)
        expect(result.outcome).toBe(outcome)
        expect(result.percentage).toBe(percentage)
        expect(result.move).toBe(payload.move)
        expect(result.closingPrice).toBe(payload.closingPrice)
        expect(result.openingPrice).toBe(payload.openingPrice)
        expect(result.user._id.toString()).toEqual(user._id.toString())
        expect(result.investment._id.toString()).toEqual(
          investment._id.toString()
        )
        expect(result.forecast._id.toString()).toEqual(forecast._id.toString())

        const tradeCount = await tradeModel.count(result)
        expect(tradeCount).toBe(1)

        expect(updateInvestmentTradeDetailsMock).toHaveBeenCalledTimes(2)
        expect(updateInvestmentTradeDetailsMock).toHaveBeenCalledWith(
          { _id: investment._id },
          expect.objectContaining({ _id: result._id })
        )
      })
    })
  })
  describe('updateStatus', () => {
    describe('given trade id those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const investment = await investmentModel.create(investmentA)
        const forecast = await forecastModel.create(forecastA)

        await expect(
          tradeService.updateStatus(investment, forecast)
        ).rejects.toThrow(
          `The (${forecast.mode}) trade with a forecast of (${forecast._id}) and investment of (${investment._id}) could not be found`
        )
      })
    })
    describe('given the status has already been settle', () => {
      it('should throw a 400 error', async () => {
        request
        const user = await userModel.create(userAInput)
        const investment = await investmentModel.create(investmentA)
        const forecast = await forecastModel.create({
          ...forecastA,
          status: ForecastStatus.SETTLED,
          percentageProfit: 0.025,
        })

        await tradeService.create(user._id, investment, forecast)

        await forecast.save()

        await expect(
          tradeService.updateStatus(investment, forecast)
        ).rejects.toThrow('This trade has already been settled')
      })
    })
    describe('given the status is set to settled but not percentageProfit in the forecast', () => {
      it('should throw a 400 error', async () => {
        request
        const user = await userModel.create(userAInput)
        const investment = await investmentModel.create(investmentA)
        const forecast = await forecastModel.create({
          ...forecastA,
          status: ForecastStatus.RUNNING,
        })

        await tradeService.create(user._id, investment, forecast)

        forecast.status = ForecastStatus.SETTLED

        await forecast.save()

        await expect(
          tradeService.updateStatus(investment, forecast)
        ).rejects.toThrow(
          'Percentage profit is required when the forecast is being settled'
        )
      })
    })
    describe('on success', () => {
      const testCase = [
        { status: ForecastStatus.MARKET_CLOSED },
        { status: ForecastStatus.ON_HOLD },
        { status: ForecastStatus.SETTLED },
        { status: ForecastStatus.RUNNING },
      ]

      test.each(testCase)(
        'should return a payload of status $status',
        async ({ status }) => {
          request
          const user = await userModel.create(userAInput)
          const investment = await investmentModel.create(investmentA)
          const forecast = await forecastModel.create(forecastA)

          const oldTradeObj = await tradeService.create(
            user._id,
            investment,
            forecast
          )

          expect(oldTradeObj.status).toBe(ForecastStatus.PREPARING)
          expect(oldTradeObj.move).toBe(undefined)
          expect(oldTradeObj.startTime).toBe(undefined)
          expect(oldTradeObj.runTime).toBe(0)
          expect(oldTradeObj.timeStamps).toEqual([])

          investment.currentTrade = oldTradeObj

          await investment.save()

          const payload = {
            status,
            startTime: new Date(),
            timeStamps: [100, 100, 100],
            runTime: 300,
            move: ForecastMove.LONG,
          }

          forecast.status = payload.status
          forecast.startTime = payload.startTime
          forecast.timeStamps = payload.timeStamps
          forecast.runTime = payload.runTime
          forecast.move = payload.move

          if (status === ForecastStatus.SETTLED) {
            forecast.percentageProfit = 0.025
          }

          await forecast.save()

          const result = await tradeService.updateStatus(investment, forecast)

          const amount = investment.amount
          const stake = forecast.stakeRate * amount
          const profit = forecast.percentageProfit
            ? forecast.percentageProfit * amount
            : undefined
          const outcome = profit ? stake + profit : undefined
          const percentage = profit ? profit / stake : undefined

          expect(result.status).toBe(payload.status)
          expect(result.move).toBe(payload.move)
          expect(result.runTime).toBe(payload.runTime)
          expect(result.startTime).toBe(payload.startTime)
          expect(result.timeStamps).toEqual(payload.timeStamps)
          expect(result.stake).toEqual(stake)
          expect(result.profit).toEqual(profit)
          expect(result.outcome).toEqual(outcome)
          expect(result.percentage).toEqual(percentage)

          const tradeCount = await tradeModel.count(result)
          expect(tradeCount).toBe(1)

          expect(updateInvestmentTradeDetailsMock).toHaveBeenCalledTimes(2)
          expect(updateInvestmentTradeDetailsMock).toHaveBeenCalledWith(
            { _id: investment._id },
            expect.objectContaining({ _id: result._id })
          )

          let notificationMessage: string = ''
          let notificationTitle: string = ''
          switch (status) {
            case ForecastStatus.RUNNING:
              notificationMessage = 'is now running'
              notificationTitle = NotificationTitle.TRADE_RUNNING
              break
            case ForecastStatus.MARKET_CLOSED:
              notificationMessage = 'market has closed'
              notificationTitle = NotificationTitle.TRADE_MARKET_CLOSED
              break
            case ForecastStatus.ON_HOLD:
              notificationMessage = 'is currently on hold'
              notificationTitle = NotificationTitle.TRADE_ON_HOLD
              break
            case ForecastStatus.SETTLED:
              notificationMessage = 'has been settled'
              notificationTitle = NotificationTitle.TRADE_SETTLED
              break
          }

          if (status === ForecastStatus.SETTLED) {
            expect(createTransactionMock).toBeCalledTimes(2)
            expect(createTransactionMock).toHaveBeenNthCalledWith(
              2,
              expect.objectContaining({
                _id: user._id,
              }),
              TransactionTitle.TRADE_SETTLED,
              expect.objectContaining({
                _id: result._id,
              }),
              outcome,
              result.environment
            )
          }

          expect(createNotificationMock).toHaveBeenCalledTimes(2)
          expect(createNotificationMock).toHaveBeenNthCalledWith(
            2,
            `Your ${investment.plan.name} investment plan current trade ${notificationMessage}`,
            notificationTitle,
            expect.objectContaining({ _id: result._id }),
            NotificationForWho.USER,
            result.environment,
            expect.objectContaining({ _id: user._id })
          )
        }
      )
    })
  })
})
