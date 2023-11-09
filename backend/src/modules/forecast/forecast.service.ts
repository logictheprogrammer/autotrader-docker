import { IInvestmentService } from '@/modules/investment/investment.interface'
import { Inject, Service } from 'typedi'
import {
  IForecast,
  IForecastObject,
  IForecastService,
} from '@/modules/forecast/forecast.interface'
import forecastModel from '@/modules/forecast/forecast.model'
import { ForecastMove, ForecastStatus } from '@/modules/forecast/forecast.enum'
import { IPlanObject, IPlanService } from '@/modules/plan/plan.interface'
import { IPairObject, IPairService } from '../pair/pair.interface'
import { IMathService, IMathUtility } from '../math/math.interface'
import { FilterQuery, ObjectId } from 'mongoose'
import { IAssetObject } from '../asset/asset.interface'
import { ITradeService } from '../trade/trade.interface'
import { BadRequestError, InternalError, NotFoundError } from '@/core/apiError'
import ServiceToken from '@/core/serviceToken'
import Helpers from '@/utils/helpers'
import { PlanMode } from '../plan/plan.enum'
import { InvestmentStatus } from '../investment/investment.enum'

@Service()
class ForecastService implements IForecastService {
  private forecastModel = forecastModel

  public static minStakeRate = 0.1
  public static maxStakeRate = 0.25
  public static minDailyWaitTime = 4 * 60 * 60 * 1000
  public static maxDailyWaitTime = 8 * 60 * 60 * 1000
  // public static profitProbability = 0.5

  public constructor(
    @Inject(ServiceToken.PLAN_SERVICE)
    private planService: IPlanService,
    @Inject(ServiceToken.PAIR_SERVICE)
    private pairService: IPairService,
    @Inject(ServiceToken.MATH_SERVICE)
    private mathService: IMathService,
    @Inject(ServiceToken.MATH_UTILITY)
    private mathUtility: IMathUtility,
    @Inject(ServiceToken.INVESTMENT_SERVICE)
    private investmentService: IInvestmentService,
    @Inject(ServiceToken.TRADE_SERVICE)
    private tradeService: ITradeService
  ) {}

  private getForecastWaitTime(dailyForcast: number): number {
    const min = ForecastService.minDailyWaitTime / dailyForcast
    const max = ForecastService.maxDailyWaitTime / dailyForcast
    return this.mathUtility.getRandomNumberFromRange(min, max)
  }

  private getDurationTime(plan: IPlanObject): number {
    return (
      plan.tradingDays * 24 * 60 * 60 * 1000 -
      this.getForecastWaitTime(1) * plan.tradingDays
    )
  }

  private async getTodaysTotalForecast(plan: IPlanObject): Promise<number> {
    const today = new Date(new Date().setHours(0, 0, 0, 0))
    return await this.forecastModel
      .count({
        plan: plan._id,
        createdAt: {
          $gte: today,
        },
      })
      .exec()
  }

  public async create(
    plan: IPlanObject,
    pair: IPairObject,
    stakeRate: number
  ): Promise<{ forecast: IForecastObject; errors: any[] }> {
    const errors: any[] = []

    const forecast = await this.forecastModel.create({
      plan,
      pair,
      market: pair.assetType,
      stakeRate,
      mode: plan.mode,
    })

    await this.planService.updateForecastDetails(
      { _id: forecast.plan._id },
      forecast
    )

    const activePlanInvestments = await this.investmentService.fetchAll({
      mode: plan.mode,
      status: InvestmentStatus.AWAITING_TRADE,
      plan: forecast.plan._id,
      tradeStatus: { $in: [ForecastStatus.SETTLED, undefined] },
    })

    for (let index = 0; index < activePlanInvestments.length; index++) {
      try {
        const investmentObject = activePlanInvestments[index]

        await this.tradeService.create(
          investmentObject.user._id,
          investmentObject,
          forecast
        )
      } catch (error) {
        errors.push(error)
        continue
      }
    }

    await forecast.populate('plan')
    await forecast.populate('pair')

    return { forecast, errors }
  }

  public async autoCreate(plan: IPlanObject): Promise<{
    forecast?: IForecastObject
    errors: any[]
  }> {
    let forecast: IForecastObject | undefined
    const errors: any[] = []

    try {
      // const plans = await this.planService.fetchAll({
      //   mode: PlanMode.AUTOMATIC,
      //   status: PlanStatus.ACTIVE,
      //   forecastStatus: { $in: [ForecastStatus.SETTLED, undefined] },
      // })

      if (
        plan.forecastStatus !== ForecastStatus.SETTLED &&
        plan.forecastStatus !== undefined
      ) {
        const error = new BadRequestError(
          `Plan (${plan.name} - ${plan._id}) already has an unsettled forecast`
        )
        errors.push(error)
        return { forecast, errors }
      }

      // check if its time to set the forecast
      const todaysForecast = await this.getTodaysTotalForecast(plan)
      const tradeRate = todaysForecast / plan.dailyForecasts

      const startOfDayTime = new Date().setHours(0, 0, 0, 0)
      const endOfDayTime = new Date().setHours(23, 59, 59, 999)
      const currentTime =
        new Date().getTime() - this.getForecastWaitTime(plan.dailyForecasts)

      const timeRate =
        (startOfDayTime - currentTime) / (startOfDayTime - endOfDayTime)

      if (timeRate < tradeRate) return { forecast, errors }

      let pair
      let assets = plan.assets

      while (true) {
        if (!assets.length) {
          const error = new BadRequestError(
            `There is no asset or assets with valid pairs in plan (${plan.name} - ${plan._id})`
          )
          errors.push(error)
          break
        }

        const selectedAsset = Helpers.randomPickFromArray<IAssetObject>(assets)

        const validPairs = await this.pairService.fetchAll({
          baseAsset: selectedAsset._id,
        })

        if (!validPairs.length) {
          assets = assets.filter((cur) => cur._id !== selectedAsset._id)
          continue
        }
        pair = Helpers.randomPickFromArray<IPairObject>(validPairs)
        break
      }

      if (!pair) return { forecast, errors }

      if (pair.assetType !== plan.assetType) {
        const error = new BadRequestError(
          `The pair (${pair._id}) is not compatible with this plan (${plan.name} - ${plan._id})`
        )
        errors.push(error)
        return { forecast, errors }
      }

      const stakeRate = this.mathUtility.getRandomNumberFromRange(
        ForecastService.minStakeRate,
        ForecastService.maxStakeRate
      )

      const { forecast: createdForecast, errors: createErrors } =
        await this.create(plan, pair, stakeRate)

      forecast = createdForecast

      createErrors.forEach((err) => errors.push(err))
    } catch (error) {
      errors.push(error)
    }

    return { forecast, errors }
  }

  public async manualCreate(
    planId: ObjectId,
    pairId: ObjectId,
    stakeRate: number
  ): Promise<{ forecast: IForecastObject; errors: any[] }> {
    const plan = await this.planService.fetch({ _id: planId })
    const pair = await this.pairService.fetch({ _id: pairId })

    if (!plan) throw new NotFoundError('The plan no longer exist')

    if (plan.forecastStatus && plan.forecastStatus !== ForecastStatus.SETTLED)
      throw new BadRequestError('This plan already has an unsettled forecast')

    if (!pair) throw new NotFoundError('The selected pair no longer exist')

    if (pair.assetType !== plan.assetType)
      throw new BadRequestError(
        'The pair is not compatible with this plan plan'
      )

    const result = await this.create(plan, pair, stakeRate)

    return result
  }

  public async update(
    filter: FilterQuery<IForecast>,
    pairId: ObjectId,
    stakeRate: number,
    percentageProfit?: number,
    move?: ForecastMove,
    openingPrice?: number,
    closingPrice?: number
  ): Promise<IForecastObject> {
    const pair = await this.pairService.fetch({ _id: pairId })
    if (!pair) throw new NotFoundError('The selected pair no longer exist')

    const forecast = await this.forecastModel.findOne(filter)

    if (!forecast) throw new NotFoundError('Forecast not found')

    if (pair.assetType !== forecast.market)
      throw new BadRequestError(
        `The pair is not compatible with this forecast, use a ${forecast.market} pair`
      )

    forecast.pair = pair
    forecast.market = pair.assetType
    forecast.stakeRate = stakeRate
    forecast.openingPrice = openingPrice

    if (
      forecast.status !== ForecastStatus.SETTLED &&
      (percentageProfit || closingPrice || move)
    )
      throw new BadRequestError(
        `Percentage profit, move and closeing price can only be updated on a settled forecast`
      )

    if (forecast.status === ForecastStatus.SETTLED && percentageProfit) {
      forecast.percentageProfit = percentageProfit
      forecast.closingPrice = closingPrice
      forecast.move = move
    }

    await this.planService.updateForecastDetails(
      { _id: forecast.plan._id },
      forecast
    )

    await forecast.save()

    return forecast
  }

  public async updateStatus(
    filter: FilterQuery<IForecast>,
    status: ForecastStatus,
    percentageProfit?: number
  ): Promise<{ forecast: IForecastObject; errors: any[] }> {
    const errors: any[] = []

    const forecast = await this.forecastModel
      .findOne(filter)
      .populate('plan')
      .populate('pair')

    if (!forecast) throw new NotFoundError('Forecast not found')

    const oldStatus = forecast.status
    const oldStartTime = forecast.startTime
    const oldTimeStamps = forecast.timeStamps.slice()

    if (oldStatus === ForecastStatus.SETTLED)
      throw new BadRequestError('This forecast has already been settled')

    let runtime: number
    switch (status) {
      case ForecastStatus.MARKET_CLOSED:
      case ForecastStatus.ON_HOLD:
        runtime =
          new Date().getTime() -
          (oldStartTime?.getTime() || new Date().getTime())

        if (oldStartTime) forecast.timeStamps = [...oldTimeStamps, runtime]
        forecast.startTime = undefined

        break

      case ForecastStatus.RUNNING:
        forecast.startTime = new Date()
        break
      case ForecastStatus.SETTLED:
        if (!percentageProfit)
          throw new BadRequestError(
            'Percentage profit is required when the forecast is being settled'
          )
        forecast.percentageProfit = percentageProfit
        runtime =
          new Date().getTime() -
          (oldStartTime?.getTime() || new Date().getTime())

        if (oldStartTime) forecast.timeStamps = [...oldTimeStamps, runtime]
        forecast.runTime = forecast.timeStamps.reduce(
          (acc, curr) => (acc += curr),
          0
        )
        forecast.startTime = undefined
        //  Get the right move based on the forecast profit and an api result
        // forecast.move = 'move'
        break
    }

    forecast.status = status

    await forecast.save()

    await this.planService.updateForecastDetails(
      { _id: forecast.plan._id },
      forecast
    )

    const activePlanInvestments = await this.investmentService.fetchAll({
      mode: PlanMode.AUTOMATIC,
      status: InvestmentStatus.RUNNING,
      plan: forecast.plan._id,
      tradeStatus: ForecastStatus.RUNNING,
    })

    for (let index = 0; index < activePlanInvestments.length; index++) {
      try {
        const investmentObject = activePlanInvestments[index]

        await this.tradeService.updateStatus(investmentObject, forecast)
      } catch (error) {
        errors.push(error)
        continue
      }
    }

    return { forecast, errors }
  }

  public async autoUpdateStatus(plan: IPlanObject): Promise<{
    forecast?: IForecastObject
    errors: any[]
  }> {
    let forecast: IForecastObject | undefined
    const errors: any[] = []

    try {
      // const plans = await this.planService.fetchAll({
      //   mode: PlanMode.AUTOMATIC,
      //   status: PlanStatus.ACTIVE,
      //   forecastStatus: {
      //     $or: [
      //       ForecastStatus.PREPARING,
      //       ForecastStatus.RUNNING,
      //       ForecastStatus.MARKET_CLOSED,
      //     ],
      //   },
      // })

      if (!plan.currentForecast) {
        const error = new InternalError(
          `There is no current forecast in plan (${plan.name} - ${plan._id})`
        )
        errors.push(error)
        return { forecast, errors }
      }

      const totalForecast = plan.dailyForecasts * plan.tradingDays

      const durationTime = this.getDurationTime(plan)

      const forecastTime = durationTime / totalForecast

      const forecastStatus = plan.forecastStatus
      const forecastTimeStamps = plan.forecastTimeStamps.slice()
      const forecastStartTime = plan.forecastStartTime

      const runTime =
        new Date().getTime() -
        (forecastStartTime?.getTime() || new Date().getTime())

      forecastTimeStamps.push(runTime)

      const totalRuntime = forecastTimeStamps.reduce(
        (acc, curr) => (acc += curr),
        0
      )

      // SETTLE FORECAST
      if (
        totalRuntime >= forecastTime &&
        forecastStatus === ForecastStatus.RUNNING
      ) {
        const totalForecast = plan.dailyForecasts * plan.tradingDays

        const minPercentageProfit = plan.minPercentageProfit / totalForecast
        const maxPercentageProfit = plan.maxPercentageProfit / totalForecast

        const options = this.mathService.dynamicRangeOptions(plan.winRate)
        const percentageProfit = this.mathService.dynamicRange(
          minPercentageProfit,
          maxPercentageProfit,
          options.spread,
          options.breakpoint,
          options.probability
        )

        const { forecast: updatedForecast, errors: updateErrors } =
          await this.updateStatus(
            { _id: plan.currentForecast._id },
            ForecastStatus.SETTLED,
            percentageProfit
          )

        forecast = updatedForecast
        updateErrors.forEach((err) => updateErrors.push(err))
      }

      // RUN FORCAST
      else if (forecastStatus === ForecastStatus.PREPARING) {
        const { forecast: updatedForecast, errors: updateErrors } =
          await this.updateStatus(
            { _id: plan.currentForecast._id },
            ForecastStatus.RUNNING
          )

        forecast = updatedForecast

        updateErrors.forEach((err) => updateErrors.push(err))
      }

      // CHECK IF FORECAST MARKET HAS CLOSED
      else if (forecastStatus === ForecastStatus.RUNNING) {
        // LOGIC TO CHECK IF MARKET HAS CLOSED
        // await this.updateStatus(plan.currentForecast, ForecastStatus.MARKET_CLOSED)
      }

      // CHECK IF FORECAST MARKET HAS OPENED
      else if (forecastStatus === ForecastStatus.MARKET_CLOSED) {
        // LOGIC TO CHECK IF MARKET HAS OPENED
        // await this.updateStatus(plan.currentForecast, ForecastStatus.RUNNING)
      }
    } catch (error) {
      errors.push(error)
    }

    return { forecast, errors }
  }

  public async manualUpdateStatus(
    filter: FilterQuery<IForecast>,
    status: ForecastStatus,
    percentageProfit?: number
  ): Promise<{ forecast: IForecastObject; errors: any[] }> {
    if (status === ForecastStatus.SETTLED && !percentageProfit)
      throw new BadRequestError(
        'Percentage profit is required when forecast is being settled'
      )
    const result = await this.updateStatus(filter, status, percentageProfit)

    return result
  }

  public async delete(
    filter: FilterQuery<IForecast>
  ): Promise<IForecastObject> {
    const forecast = await this.forecastModel.findOne(filter)

    if (!forecast) throw new NotFoundError('Forecast not found')

    if (forecast.status !== ForecastStatus.SETTLED)
      throw new BadRequestError('Forecast has not been settled yet')

    await this.forecastModel.deleteOne({ _id: forecast._id })

    return forecast
  }

  public async fetchAll(
    filter: FilterQuery<IForecast>
  ): Promise<IForecastObject[]> {
    return await this.forecastModel
      .find(filter)
      .populate('plan')
      .populate('pair')
  }
}

export default ForecastService
