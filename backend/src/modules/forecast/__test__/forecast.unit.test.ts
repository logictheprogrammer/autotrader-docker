import { IForecast } from '../../../modules/forecast/forecast.interface'
import { ForecastStatus } from '../../forecast/forecast.enum'
import { request } from '../../../test'
import { userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { forecastService } from '../../../setup'
import forecastModel from '../forecast.model'
import { forecastA } from './forecast.payload'
import investmentModel from '../../investment/investment.model'
import { investmentA } from '../../investment/__test__/investment.payload'
import pairModel from '../../pair/pair.model'
import { pairA } from '../../pair/__test__/pair.payload'
import { IUser } from '../../user/user.interface'
import { IPair } from '../../pair/pair.interface'
import { IInvestment } from '../../investment/investment.interface'
import { Types } from 'mongoose'

describe('forecast', () => {
  describe('_createTransaction', () => {
    it('should return a forecast transaction instance', async () => {
      request
      const user = await userModel.create(userA)
      const investment = await investmentModel.create(investmentA)
      const pair = await pairModel.create(pairA)

      const forecastInstance = await forecastService._createTransaction(
        user.toObject({ getters: true }),
        investment.toObject({ getters: true }),
        pair.toObject({ getters: true }),
        forecastA.stake,
        forecastA.outcome,
        forecastA.profit,
        forecastA.percentage,
        forecastA.investmentPercentage,
        forecastA.environment
      )

      expect(forecastInstance.object.outcome).toBe(forecastA.outcome)
      expect(forecastInstance.object.user.toString()).toEqual(
        user._id.toString()
      )
      expect(forecastInstance.object.investment.toString()).toBe(
        investment._id.toString()
      )
      expect(forecastInstance.object.pair.toString()).toBe(pair._id.toString())

      expect(forecastInstance.instance.onFailed).toContain(
        `Delete the forecast with an id of (${forecastInstance.instance.model._id})`
      )
    })
  })
  describe('_updateStatusTransaction', () => {
    describe('given forecast id those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const forecast = await forecastModel.create(forecastA)

        expect(forecast.status).toBe(ForecastStatus.PREPARING)

        await expect(
          forecastService._updateStatusTransaction(
            new Types.ObjectId(),
            ForecastStatus.RUNNING
          )
        ).rejects.toThrow('Forecast not found')
      })
    })
    describe('given the status has already been settle', () => {
      it('should throw a 400 error', async () => {
        request
        const forecast = await forecastModel.create({
          ...forecastA,
          status: ForecastStatus.SETTLED,
        })

        expect(forecast.status).toBe(ForecastStatus.SETTLED)

        await expect(
          forecastService._updateStatusTransaction(
            forecast._id,
            ForecastStatus.ON_HOLD
          )
        ).rejects.toThrow('This forecast has already been settled')
      })
    })
    describe('given forecast was on hold', () => {
      it('should return a forecast transaction instance with on hold status', async () => {
        request
        const forecast = await forecastModel.create(forecastA)

        expect(forecast.status).toBe(ForecastStatus.PREPARING)

        const forecastInstance = await forecastService._updateStatusTransaction(
          forecast._id,
          ForecastStatus.ON_HOLD
        )

        expect(forecastInstance.object.status).toBe(ForecastStatus.ON_HOLD)

        expect(forecastInstance.instance.onFailed).toContain(
          `Set the status of the forecast with an id of (${forecastInstance.instance.model._id}) to (${ForecastStatus.PREPARING})`
        )
      })
    })
  })
})
