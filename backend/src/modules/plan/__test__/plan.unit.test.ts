import { request } from '../../../test'
import planModel from '../../../modules/plan/plan.model'
import { planA } from './plan.payload'
import { planService } from '../../../setup'
import assetModel from '../../asset/asset.model'
import { assetA, assetA_id } from '../../asset/__test__/asset.payload'
import { Types } from 'mongoose'
import { ForecastStatus } from '../../forecast/forecast.enum'
import ForecastModel from '../../forecast/forecast.model'
import { forecastA } from '../../forecast/__test__/forecast.payload'
import Helpers from '../../../utils/helpers'

describe('plan', () => {
  request
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(planService)
      expect(methods).toEqual([
        'planModel',
        'forecastModel',
        'create',
        'update',
        'updateStatus',
        'updateForecastDetails',
        'fetch',
        'count',
        'delete',
        'fetchAll',
      ])
    })
  })
  describe('fetch plan', () => {
    describe('given plan those not exist', () => {
      it('should throw an error', async () => {
        await expect(
          planService.fetch({ _id: new Types.ObjectId() })
        ).rejects.toThrowError('Plan not found')
      })
    })

    describe('given plan exist', () => {
      it('should return the plan payload', async () => {
        await assetModel.create({ ...assetA, _id: assetA_id })
        const plan = await planModel.create(planA)

        await plan.populate('assets')

        const result = await planService.fetch(plan._id)

        expect(result._id).toEqual(plan._id)
      })
    })
  })
  describe('updateForecastDetails', () => {
    describe('given plan those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const forecast = await ForecastModel.create(forecastA)

        try {
          await planService.updateForecastDetails(
            { _id: new Types.ObjectId() },
            forecast
          )
        } catch (error: any) {
          expect(error.message).toBe('Plan not found')
        }
      })
    })
    describe('given plan those not exist', () => {
      it('should throw a 404 error', async () => {
        request
        const forecast = await ForecastModel.create(forecastA)

        try {
          await planService.updateForecastDetails(
            { _id: new Types.ObjectId() },
            forecast
          )
        } catch (error: any) {
          expect(error.message).toBe('Plan not found')
        }
      })
    })
    describe('given forecast status is settled but no profit is in forecast', () => {
      it('should throw a 400 error', async () => {
        request

        const plan = await planModel.create(planA)
        const forecast = await ForecastModel.create({
          ...forecastA,
          status: ForecastStatus.SETTLED,
          profit: undefined,
        })

        try {
          await planService.updateForecastDetails({ _id: plan._id }, forecast)
        } catch (error: any) {
          expect(error.message).toBe(
            'Percentage profit is required when the forecast is being settled'
          )
        }
      })
    })
    describe('on success', () => {
      const testCases = [
        { status: ForecastStatus.MARKET_CLOSED },
        { status: ForecastStatus.ON_HOLD },
        { status: ForecastStatus.PREPARING },
        { status: ForecastStatus.RUNNING },
        { status: ForecastStatus.SETTLED },
      ]

      test.each(testCases)(
        'should return a plan payload based on the status $status',
        async ({ status }) => {
          request

          const plan = await planModel.create(planA)
          const forecast = await ForecastModel.create({ ...forecastA, status })

          const planObj = await planService.updateForecastDetails(
            { _id: plan._id },
            forecast
          )

          if (status === ForecastStatus.SETTLED) {
            expect(planObj.currentForecast).toBe(undefined)
            expect(planObj.forecastStatus).toBe(undefined)
            expect(planObj.forecastStartTime).toBe(undefined)
            expect(planObj.forecastTimeStamps).toEqual([])
          } else {
            expect(planObj.currentForecast._id.toString()).toBe(
              forecast._id.toString()
            )
            expect(planObj.forecastStatus).toBe(status)
          }
        }
      )
    })
  })
})
