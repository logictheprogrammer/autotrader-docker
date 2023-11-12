import { investmentA } from './../../investment/__test__/investment.payload'
import InvestmentModel from '../../../modules/investment/investment.model'
import {
  userAInput,
  userA_id,
  userBInput,
  userB_id,
} from './../../user/__test__/user.payload'
import UserModel from '../../../modules/user/user.model'
import {
  createTradeMock,
  updateStatusTradeMock,
} from './../../trade/__test__/trade.mock'
import { BadRequestError } from '../../../core/apiError'
import { planA, planA_id } from './../../plan/__test__/plan.payload'
import PlanModel from '../../../modules/plan/plan.model'
import {
  assetA,
  assetA_id,
  assetB,
  assetB_id,
  assetC,
  assetC_id,
} from './../../asset/__test__/asset.payload'
import AssetModel from '../../../modules/asset/asset.model'
import { ForecastStatus } from '../../forecast/forecast.enum'
import { request } from '../../../test'
import { forecastService } from '../../../setup'
import forecastModel from '../forecast.model'
import { forecastA } from './forecast.payload'
import pairModel from '../../pair/pair.model'
import { pairA, pairA_id } from '../../pair/__test__/pair.payload'
import { Types } from 'mongoose'
import { PlanMode, PlanStatus } from '../../plan/plan.enum'
import { AssetType } from '../../asset/asset.enum'
import { updatePlanForecastDetailsMock } from '../../plan/__test__/plan.mock'
import { InvestmentStatus } from '../../investment/investment.enum'
import ForecastModel from '../forecast.model'
import {
  dynamicRangeMock,
  dynamicRangeOptionsMock,
} from '../../math/__test__/math.mock'

describe('forecast', () => {
  describe('autocreate', () => {
    describe('given plan already has an unsettled forecast', () => {
      it('should return an empty forecast with one error', async () => {
        request
        const asset1 = await AssetModel.create({ ...assetA, _id: assetA_id })
        const asset2 = await AssetModel.create({ ...assetB, _id: assetB_id })
        const asset3 = await AssetModel.create({ ...assetC, _id: assetC_id })

        const plan1 = await PlanModel.create({
          ...planA,
          forecastStatus: ForecastStatus.PREPARING,
        })

        const result = await forecastService.autoCreate(plan1)

        expect(updatePlanForecastDetailsMock).toBeCalledTimes(0)

        expect(result).toEqual({
          forecast: undefined,
          errors: [
            new BadRequestError(
              `Plan (${plan1.name} - ${plan1._id}) already has an unsettled forecast`
            ),
          ],
        })
      })
    })
    describe('given plan assets those not have a valid pair', () => {
      it('should return an empty forecast with one error', async () => {
        request
        const asset1 = await AssetModel.create({ ...assetA, _id: assetA_id })
        const asset2 = await AssetModel.create({ ...assetB, _id: assetB_id })
        const asset3 = await AssetModel.create({ ...assetC, _id: assetC_id })

        const plan1 = await PlanModel.create({
          ...planA,
        })

        const result = await forecastService.autoCreate(plan1)

        expect(updatePlanForecastDetailsMock).toBeCalledTimes(0)

        expect(result).toEqual({
          forecast: undefined,
          errors: [
            new BadRequestError(
              `There is no asset or assets with valid pairs in plan (${plan1.name} - ${plan1._id})`
            ),
          ],
        })
      })
    })
    describe('given the plan asset type and the pair asset type are not the same', () => {
      it('should return an empty forecast with one error', async () => {
        request
        const asset1 = await AssetModel.create({ ...assetA, _id: assetA_id })
        const asset2 = await AssetModel.create({ ...assetB, _id: assetB_id })
        const asset3 = await AssetModel.create({ ...assetC, _id: assetC_id })
        const pair1 = await pairModel.create({
          ...pairA,
          assetType: AssetType.FOREX,
          _id: pairA_id,
        })

        const plan1 = await PlanModel.create({
          ...planA,
        })

        const result = await forecastService.autoCreate(plan1)

        expect(updatePlanForecastDetailsMock).toBeCalledTimes(0)

        expect(result).toEqual({
          forecast: undefined,
          errors: [
            new BadRequestError(
              `The pair (${pair1._id}) is not compatible with this plan (${plan1.name} - ${plan1._id})`
            ),
          ],
        })
      })
    })
    describe('given the plan those not have active investments', () => {
      it('should return an one forecast', async () => {
        request
        const asset1 = await AssetModel.create({ ...assetA, _id: assetA_id })
        const asset2 = await AssetModel.create({ ...assetB, _id: assetB_id })
        const asset3 = await AssetModel.create({ ...assetC, _id: assetC_id })
        const pair1 = await pairModel.create({
          ...pairA,
          _id: pairA_id,
        })

        const plan1 = await PlanModel.create({
          ...planA,
        })

        const result = await forecastService.autoCreate(plan1)

        expect(updatePlanForecastDetailsMock).toBeCalledTimes(1)
        expect(updatePlanForecastDetailsMock).toBeCalledWith(
          { _id: plan1._id },
          result.forecast
        )

        expect(createTradeMock).toHaveBeenCalledTimes(0)

        expect(result.errors).toEqual([])
        expect(result.forecast?.pair._id.toString()).toEqual(
          pair1._id.toString()
        )
        expect(result.forecast?.plan._id.toString()).toEqual(
          plan1._id.toString()
        )
      })
    })
    describe('given the plan have active three running investments', () => {
      it('should return an one forecast and create three trades', async () => {
        request
        await AssetModel.create({ ...assetA, _id: assetA_id })
        await AssetModel.create({ ...assetB, _id: assetB_id })
        await AssetModel.create({ ...assetC, _id: assetC_id })
        const user1 = await UserModel.create({ ...userAInput, _id: userA_id })
        const user2 = await UserModel.create({ ...userBInput, _id: userB_id })
        const pair1 = await pairModel.create({
          ...pairA,
          _id: pairA_id,
        })

        const plan1 = await PlanModel.create({
          ...planA,
          _id: planA_id,
        })

        const investment1 = await InvestmentModel.create({
          ...investmentA,
          user: user1._id,
        })

        const investment2 = await InvestmentModel.create({
          ...investmentA,
          user: user1._id,
        })

        const investment3 = await InvestmentModel.create({
          ...investmentA,
          user: user2._id,
        })

        const result = await forecastService.autoCreate(plan1)

        expect(updatePlanForecastDetailsMock).toBeCalledTimes(1)
        expect(updatePlanForecastDetailsMock).toBeCalledWith(
          { _id: plan1._id },
          result.forecast
        )

        expect(createTradeMock).toHaveBeenCalledTimes(0)

        expect(result.errors).toEqual([])
        expect(result.forecast?.pair._id.toString()).toEqual(
          pair1._id.toString()
        )
        expect(result.forecast?.plan._id.toString()).toEqual(
          plan1._id.toString()
        )

        const forecastCount = await ForecastModel.count(result.forecast)
        expect(forecastCount).toBe(1)
      })
    })
    describe('given the plan have three awaiting investments', () => {
      it('should return an one forecast and create three trades', async () => {
        request
        await AssetModel.create({ ...assetA, _id: assetA_id })
        await AssetModel.create({ ...assetB, _id: assetB_id })
        await AssetModel.create({ ...assetC, _id: assetC_id })
        const user1 = await UserModel.create({ ...userAInput, _id: userA_id })
        const user2 = await UserModel.create({ ...userBInput, _id: userB_id })
        const pair1 = await pairModel.create({
          ...pairA,
          _id: pairA_id,
        })

        const plan1 = await PlanModel.create({
          ...planA,
          _id: planA_id,
        })

        const investment1 = await InvestmentModel.create({
          ...investmentA,
          user: user1._id,
          status: InvestmentStatus.AWAITING_TRADE,
        })

        const investment2 = await InvestmentModel.create({
          ...investmentA,
          user: user1._id,
          status: InvestmentStatus.AWAITING_TRADE,
        })

        const investment3 = await InvestmentModel.create({
          ...investmentA,
          user: user2._id,
          status: InvestmentStatus.AWAITING_TRADE,
        })

        const result = await forecastService.autoCreate(plan1)

        expect(updatePlanForecastDetailsMock).toBeCalledTimes(1)
        expect(updatePlanForecastDetailsMock).toBeCalledWith(
          { _id: plan1._id },
          result.forecast
        )

        expect(createTradeMock).toHaveBeenCalledTimes(3)
        expect(createTradeMock).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining(user1._id),
          expect.objectContaining({ _id: investment1._id }),
          expect.objectContaining({ _id: result.forecast?._id })
        )
        expect(createTradeMock).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining(user1._id),
          expect.objectContaining({ _id: investment2._id }),
          expect.objectContaining({ _id: result.forecast?._id })
        )
        expect(createTradeMock).toHaveBeenNthCalledWith(
          3,
          expect.objectContaining(user2._id),
          expect.objectContaining({ _id: investment3._id }),
          expect.objectContaining({ _id: result.forecast?._id })
        )

        expect(result.errors).toEqual([])
        expect(result.forecast?.pair._id.toString()).toEqual(
          pair1._id.toString()
        )
        expect(result.forecast?.plan._id.toString()).toEqual(
          plan1._id.toString()
        )

        const forecastCount = await ForecastModel.count(result.forecast)
        expect(forecastCount).toBe(1)
      })
    })
  })
  describe('autoUpdateStatus', () => {
    describe('given plan those not have an unsettled forecast', () => {
      it('should return an empty forecast with one error', async () => {
        request
        const asset1 = await AssetModel.create({ ...assetA, _id: assetA_id })
        const asset2 = await AssetModel.create({ ...assetB, _id: assetB_id })
        const asset3 = await AssetModel.create({ ...assetC, _id: assetC_id })

        await pairModel.create({
          ...pairA,
          _id: pairA_id,
        })

        const plan1 = await PlanModel.create({
          ...planA,
        })

        const result = await forecastService.autoUpdateStatus(plan1)

        expect(updatePlanForecastDetailsMock).toBeCalledTimes(0)

        expect(result).toEqual({
          forecast: undefined,
          errors: [
            new BadRequestError(
              `There is no current forecast in plan (${plan1.name} - ${plan1._id})`
            ),
          ],
        })
      })
    })
    describe('given old status is preparing', () => {
      it('should return an one forecast with a status of running', async () => {
        request
        await AssetModel.create({ ...assetA, _id: assetA_id })
        await AssetModel.create({ ...assetB, _id: assetB_id })
        await AssetModel.create({ ...assetC, _id: assetC_id })
        const user1 = await UserModel.create({ ...userAInput, _id: userA_id })
        const pair1 = await pairModel.create({
          ...pairA,
          _id: pairA_id,
        })

        const plan1 = await PlanModel.create({
          ...planA,
          _id: planA_id,
        })

        const investment1 = await InvestmentModel.create({
          ...investmentA,
          user: user1._id,
          status: InvestmentStatus.AWAITING_TRADE,
        })

        const oldResult = await forecastService.autoCreate(plan1)

        const forecast = await ForecastModel.findById(oldResult.forecast?._id)

        await forecast!.save()

        plan1.currentForecast = forecast
        plan1.forecastStatus = forecast!.status

        await plan1.save()

        investment1.status = InvestmentStatus.RUNNING
        investment1.tradeStatus = ForecastStatus.RUNNING

        await investment1.save()

        const result = await forecastService.autoUpdateStatus(plan1)

        expect(result.errors).toEqual([])
        expect(result.forecast?._id.toString()).toBe(forecast?._id.toString())
        expect(result.forecast?.status).toBe(ForecastStatus.RUNNING)

        expect(updatePlanForecastDetailsMock).toBeCalledTimes(2)
        expect(updatePlanForecastDetailsMock).toHaveBeenNthCalledWith(
          2,
          {
            _id: plan1._id,
            currentForecast: new Types.ObjectId(forecast?._id),
          },
          result.forecast
        )

        expect(updateStatusTradeMock).toHaveBeenCalledTimes(1)
        expect(updateStatusTradeMock).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({ _id: investment1._id }),
          expect.objectContaining({ _id: result.forecast?._id })
        )

        const forecastCount = await ForecastModel.count(result.forecast)
        expect(forecastCount).toBe(1)
      })
    })
    describe('given forecast has been running over the completed time', () => {
      it('should return an one forecast with a status of settled', async () => {
        request
        await AssetModel.create({ ...assetA, _id: assetA_id })
        await AssetModel.create({ ...assetB, _id: assetB_id })
        await AssetModel.create({ ...assetC, _id: assetC_id })
        const user1 = await UserModel.create({ ...userAInput, _id: userA_id })
        const pair1 = await pairModel.create({
          ...pairA,
          _id: pairA_id,
        })

        const plan1 = await PlanModel.create({
          ...planA,
          _id: planA_id,
        })

        const investment1 = await InvestmentModel.create({
          ...investmentA,
          user: user1._id,
          status: InvestmentStatus.AWAITING_TRADE,
        })

        const oldResult = await forecastService.autoCreate(plan1)

        const forecast = await ForecastModel.findById(oldResult.forecast?._id)

        forecast!.startTime = new Date(
          new Date().setHours(new Date().getHours() - 10)
        )

        forecast!.status = ForecastStatus.RUNNING

        await forecast!.save()

        plan1.currentForecast = forecast
        plan1.forecastStatus = forecast!.status
        plan1.forecastStartTime = forecast!.startTime

        await plan1.save()

        investment1.status = InvestmentStatus.RUNNING
        investment1.tradeStatus = ForecastStatus.RUNNING

        await investment1.save()

        const result = await forecastService.autoUpdateStatus(plan1)

        expect(result.errors).toEqual([])
        expect(result.forecast?._id.toString()).toBe(forecast?._id.toString())
        expect(result.forecast?.status).toBe(ForecastStatus.SETTLED)

        expect(dynamicRangeOptionsMock).toHaveBeenCalledTimes(1)
        expect(dynamicRangeOptionsMock).toHaveBeenCalledWith(plan1.winRate)

        const totalForecast = plan1.dailyForecasts * plan1.tradingDays

        const minPercentageProfit = plan1.minPercentageProfit / totalForecast
        const maxPercentageProfit = plan1.maxPercentageProfit / totalForecast

        expect(result.forecast?.percentageProfit).toBe(minPercentageProfit)
        expect(result.forecast?.startTime).toBe(undefined)

        const options = {
          breakpoint: 1,
          spread: 2,
          probability: 0.5,
        }

        expect(dynamicRangeMock).toHaveBeenCalledTimes(1)
        expect(dynamicRangeMock).toHaveBeenCalledWith(
          minPercentageProfit,
          maxPercentageProfit,
          options.spread,
          options.breakpoint,
          options.probability
        )

        expect(updatePlanForecastDetailsMock).toBeCalledTimes(2)
        expect(updatePlanForecastDetailsMock).toHaveBeenNthCalledWith(
          2,
          {
            _id: plan1._id,
            currentForecast: new Types.ObjectId(forecast?._id),
          },
          result.forecast
        )

        expect(updateStatusTradeMock).toHaveBeenCalledTimes(1)
        expect(updateStatusTradeMock).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({ _id: investment1._id }),
          expect.objectContaining({ _id: result.forecast?._id })
        )

        const forecastCount = await ForecastModel.count(result.forecast)
        expect(forecastCount).toBe(1)
      })
    })
  })
})
