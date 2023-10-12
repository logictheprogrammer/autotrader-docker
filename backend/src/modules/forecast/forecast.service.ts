import {
  IInvestment,
  IInvestmentService,
} from '@/modules/investment/investment.interface'
import { Inject, Service } from 'typedi'
import {
  IForecast,
  IForecastObject,
  IForecastService,
} from '@/modules/forecast/forecast.interface'
import forecastModel from '@/modules/forecast/forecast.model'
import ServiceToken from '@/utils/enums/serviceToken'
import { ForecastMove, ForecastStatus } from '@/modules/forecast/forecast.enum'
import { IPlan, IPlanObject, IPlanService } from '@/modules/plan/plan.interface'
import { IUser } from '@/modules/user/user.interface'
import { ITransaction } from '@/modules/transaction/transaction.interface'
import { INotification } from '@/modules/notification/notification.interface'
import {
  ITransactionInstance,
  ITransactionManagerService,
} from '@/modules/transactionManager/transactionManager.interface'
import { THttpResponse } from '@/modules/http/http.type'
import HttpException from '@/modules/http/http.exception'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import AppException from '@/modules/app/app.exception'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { IPairObject, IPairService } from '../pair/pair.interface'
import Helpers from 'helpers/helpers'
import { IMathService } from '../math/math.interface'
import { ObjectId } from 'mongoose'
import { IAsset } from '../asset/asset.interface'
import { ISendMailService } from '../sendMail/sendMail.interface'
import { ITrade, ITradeService } from '../trade/trade.interface'
import { IReferral } from '../referral/referral.interface'
import { ErrorCode } from '@/utils/enums/errorCodes.enum'
import InvestmentService from '../investment/investment.service'

@Service()
class ForecastService implements IForecastService {
  private forecastModel = forecastModel

  public static minStakeRate = 0.1
  public static maxStakeRate = 0.25
  public static minDailyWaitTime =
    InvestmentService.minWaitHour * 60 * 60 * 1000
  public static maxDailyWaitTime =
    InvestmentService.minWaitHour * 60 * 60 * 1000
  public static profitProbability = 0.5

  public constructor(
    @Inject(ServiceToken.PLAN_SERVICE)
    private planService: IPlanService,
    @Inject(ServiceToken.PAIR_SERVICE)
    private pairService: IPairService,
    @Inject(ServiceToken.MATH_SERVICE)
    private mathService: IMathService,
    @Inject(ServiceToken.INVESTMENT_SERVICE)
    private investmentService: IInvestmentService,
    @Inject(ServiceToken.TRADE_SERVICE)
    private tradeService: ITradeService,
    @Inject(ServiceToken.TRANSACTION_MANAGER_SERVICE)
    private transactionManagerService: ITransactionManagerService<any>,
    @Inject(ServiceToken.SEND_MAIL_SERVICE)
    private SendMailService: ISendMailService
  ) {}

  private async find(forecastId: ObjectId): Promise<IForecast> {
    const forecast = await this.forecastModel.findById(forecastId)

    if (!forecast) throw new HttpException(404, 'Forecast not found')

    return forecast
  }

  private getForecastWaitTime(dailyForcast: number, duration: number): number {
    const min = ForecastService.minDailyWaitTime / dailyForcast
    const max = ForecastService.maxDailyWaitTime / dailyForcast
    return this.mathService.probabilityValue(min, max, 0.76)
  }

  private getDurationTime(plan: IPlanObject): number {
    return (
      plan.duration * 24 * 60 * 60 * 1000 -
      this.getForecastWaitTime(plan.dailyForecasts, plan.duration) *
        plan.duration
    )
  }

  public async _createTransaction(
    plan: IPlanObject,
    pair: IPairObject,
    percentageProfit: number,
    stakeRate: number
  ): TTransaction<IForecastObject, IForecast> {
    const forecast = new this.forecastModel({
      plan: plan._id,
      planObject: plan,
      pair: pair._id,
      pairObject: pair,
      market: pair.assetType,
      percentageProfit,
      stakeRate,
      manualMode: plan.manualMode,
    })

    return {
      object: forecast.toObject({ getters: true }),
      instance: {
        model: forecast,
        onFailed: `Delete the forecast with an id of (${forecast._id})`,
        callback: async () => {
          await this.forecastModel.deleteOne({ _id: forecast._id })
        },
      },
    }
  }

  public async _updateTransaction(
    forecastId: ObjectId,
    pair: IPairObject,
    percentageProfit: number,
    stakeRate: number,
    move?: ForecastMove,
    openingPrice?: number,
    closingPrice?: number
  ): TTransaction<IForecastObject, IForecast> {
    const forecast = await this.find(forecastId)

    if (pair.assetType !== forecast.market)
      throw new HttpException(
        400,
        `The pair is not compatible with this forecast, use a ${forecast.market} pair`
      )

    const oldPair = forecast.pair
    const oldPairObject = forecast.pairObject
    const oldMarket = forecast.market
    const oldMove = forecast.move
    const oldPercentageProfit = forecast.percentageProfit
    const oldStakeRate = forecast.stakeRate
    const oldOpeningPrice = forecast.openingPrice
    const oldClosingPrice = forecast.closingPrice

    forecast.pair = pair._id
    forecast.pairObject = pair
    forecast.market = pair.assetType
    forecast.move = move
    forecast.percentageProfit = percentageProfit
    forecast.stakeRate = stakeRate
    forecast.openingPrice = openingPrice
    forecast.closingPrice = closingPrice

    return {
      object: forecast.toObject({ getters: true }),
      instance: {
        model: forecast,
        onFailed: `Set the forecast with an id of (${forecast._id}) to the following: 
        \npair = (${oldPair}), 
        \npairObject = (${oldPairObject}), 
        \nmarket = (${oldMarket}), 
        \nmove = (${oldMove}), 
        \npercentageProfit = (${oldPercentageProfit}), 
        \nstakeRate = (${oldStakeRate}), 
        \nopeningPrice = (${oldOpeningPrice}), 
        \nclosingPrice = (${oldClosingPrice})`,
        callback: async () => {
          forecast.pair = oldPair
          forecast.pairObject = oldPairObject
          forecast.market = oldMarket
          forecast.move = oldMove
          forecast.percentageProfit = oldPercentageProfit
          forecast.stakeRate = oldStakeRate
          forecast.openingPrice = oldOpeningPrice
          forecast.closingPrice = oldClosingPrice
          await forecast.save()
        },
      },
    }
  }

  public async _updateStatusTransaction(
    forecastId: ObjectId,
    status: ForecastStatus,
    move?: ForecastMove
  ): TTransaction<IForecastObject, IForecast> {
    const forecast = await this.find(forecastId)

    const oldStatus = forecast.status
    const oldStartTime = forecast.startTime
    const oldTimeStamps = forecast.timeStamps.slice()
    const oldRuntime = forecast.runTime
    const oldMove = forecast.move

    if (oldStatus === ForecastStatus.SETTLED)
      throw new HttpException(400, 'This forecast has already been settled')

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

      case ForecastStatus.SETTLED:
        runtime =
          new Date().getTime() -
          (oldStartTime?.getTime() || new Date().getTime())

        if (oldStartTime) forecast.timeStamps = [...oldTimeStamps, runtime]
        forecast.runTime = forecast.timeStamps.reduce(
          (acc, curr) => (acc += curr),
          0
        )
        forecast.startTime = undefined
        forecast.move = move
    }

    forecast.status = status

    return {
      object: forecast.toObject({ getters: true }),
      instance: {
        model: forecast,
        onFailed: `Set the status of the forecast with an id of (${
          forecast._id
        }) to (${oldStatus}) and startTime to (${oldStartTime}) and timeStamps to (${JSON.stringify(
          oldTimeStamps
        )}) and move to (${oldMove}) and runtime to (${oldRuntime})`,
        callback: async () => {
          forecast.status = oldStatus
          forecast.startTime = oldStartTime
          forecast.timeStamps = oldTimeStamps
          forecast.move = oldMove
          forecast.runTime = oldRuntime
          await forecast.save()
        },
      },
    }
  }

  public async getTodaysTotalForecast(
    planObject: IPlanObject
  ): Promise<number> {
    const today = new Date(new Date().setHours(0, 0, 0, 0))
    return this.forecastModel
      .count({
        plan: planObject._id,
        createdAt: {
          $gte: today,
        },
      })
      .exec()
  }

  public async create(
    plan: IPlanObject,
    pair: IPairObject,
    percentageProfit: number,
    stakeRate: number
  ): Promise<IForecast> {
    const transactionInstances: ITransactionInstance<
      | IForecast
      | IReferral
      | ITransaction
      | INotification
      | IInvestment
      | ITrade
      | IUser
      | IPlan
    >[] = []

    const { object: forecastObject, instance: forecastTransactionInstance } =
      await this._createTransaction(plan, pair, percentageProfit, stakeRate)

    transactionInstances.push(forecastTransactionInstance)

    const planTransactionInstance =
      await this.planService.updateForecastDetails(
        forecastObject.plan,
        forecastObject
      )

    transactionInstances.push(planTransactionInstance)

    const activePlanInvestments =
      await this.investmentService.getAllAutoAwaiting(forecastObject.plan)

    for (let index = 0; index < activePlanInvestments.length; index++) {
      try {
        const investmentObject = activePlanInvestments[index]

        const tradeInstances = await this.tradeService.create(
          investmentObject.user,
          investmentObject,
          forecastObject
        )

        tradeInstances.forEach((instance) =>
          transactionInstances.push(instance)
        )
      } catch (error) {
        this.SendMailService.sendDeveloperErrorMail(error)
        continue
      }
    }

    await this.transactionManagerService.execute(transactionInstances)

    return forecastTransactionInstance.model
  }

  public async autoCreate(): Promise<void> {
    const plans = await this.planService.getAllAutoIdled()
    if (!plans.length) return

    for (let index = 0; index < plans.length; index++) {
      const plan = plans[index]

      // check if its time to set the forecast
      const totalForecast = plan.dailyForecasts * plan.duration

      const todaysForecast = await this.getTodaysTotalForecast(plan)
      const playedRate = todaysForecast / plan.dailyForecasts

      const startOfDayTime = new Date().setHours(0, 0, 0, 0)
      const endOfDayTime = new Date().setHours(23, 59, 59, 999)
      const currentTime =
        new Date().getTime() -
        this.getForecastWaitTime(plan.dailyForecasts, plan.duration)

      const timeRate =
        (startOfDayTime - currentTime) / (startOfDayTime - endOfDayTime)

      if (timeRate < playedRate) continue

      let pair
      let assets = plan.assets

      while (true) {
        if (!assets.length) {
          const error = new Error(
            `There is no assets or assets with valid pairs in plan (${plan.name} - ${plan._id})`
          )
          this.SendMailService.sendDeveloperErrorMail(error)
          break
        }

        const selectedAsset = Helpers.randomPickFromArray<IAsset>(assets)

        const validPairs = await this.pairService.getByBase(selectedAsset._id)

        if (!validPairs.length) {
          assets = assets.filter((cur) => cur._id !== selectedAsset._id)
          continue
        }
        pair = Helpers.randomPickFromArray<IPairObject>(validPairs)
        break
      }

      if (!pair) return

      if (pair.assetType !== plan.assetType) {
        const error = new Error(
          `The pair is not compatible with this plan (${plan.name} - ${plan._id})`
        )
        this.SendMailService.sendDeveloperErrorMail(error)
        break
      }

      const minPercentageProfit = plan.minPercentageProfit / totalForecast
      const maxPercentageProfit = plan.maxPercentageProfit / totalForecast

      const stakeRate = Helpers.getRandomValue(
        ForecastService.minStakeRate,
        ForecastService.maxStakeRate
      )

      const percentageProfit = this.mathService.probabilityValue(
        minPercentageProfit,
        maxPercentageProfit,
        0.76
      )

      await this.create(plan, pair, percentageProfit, stakeRate)
    }
  }

  public async manualCreate(
    planId: ObjectId,
    pairId: ObjectId,
    percentageProfit: number,
    stakeRate: number
  ): THttpResponse<{ forecast: IForecast }> {
    try {
      const plan = await this.planService.get(planId)
      const pair = await this.pairService.get(pairId)

      if (!plan) throw new HttpException(404, 'The plan no longer exist')

      if (plan.forecastStatus && plan.forecastStatus !== ForecastStatus.SETTLED)
        throw new HttpException(
          ErrorCode.BAD_REQUEST,
          'This plan already has an unsettled forecast running'
        )

      if (!pair)
        throw new HttpException(404, 'The selected pair no longer exist')

      if (pair.assetType !== plan.assetType)
        throw new HttpException(
          400,
          'The pair is not compatible with this plan plan'
        )

      const forecast = await this.create(
        plan,
        pair,
        percentageProfit,
        stakeRate
      )

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Forecast created successfully',
        data: { forecast: forecast },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to create this forecast, please try again'
      )
    }
  }

  public async update(
    forecastId: ObjectId,
    pairId: ObjectId,
    percentageProfit: number,
    stakeRate: number,
    move?: ForecastMove,
    openingPrice?: number,
    closingPrice?: number
  ): THttpResponse<{ forecast: IForecast }> {
    try {
      const pair = await this.pairService.get(pairId)
      if (!pair)
        throw new HttpException(404, 'The selected pair no longer exist')

      const transactionInstances: ITransactionInstance<IForecast>[] = []

      const {
        instance: updateForecastTransactionInstance,
        object: forecastObject,
      } = await this._updateTransaction(
        forecastId,
        pair,
        percentageProfit,
        stakeRate,
        move,
        openingPrice,
        closingPrice
      )

      transactionInstances.push(updateForecastTransactionInstance)

      await this.transactionManagerService.execute(transactionInstances)

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Forecast updated successfully',
        data: { forecast: updateForecastTransactionInstance.model },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to update this forecast, please try again'
      )
    }
  }

  public async updateStatus(
    forecastId: ObjectId,
    status: ForecastStatus
  ): Promise<IForecast> {
    const transactionInstances: ITransactionInstance<
      ITransaction | INotification | IInvestment | ITrade | IForecast | IPlan
    >[] = []

    let move

    if (status === ForecastStatus.SETTLED) {
      move = ForecastMove.LONG
    }

    const { instance: forecastInstance, object: forecastObject } =
      await this._updateStatusTransaction(forecastId, status, move)

    transactionInstances.push(forecastInstance)

    const planTransactionInstance =
      await this.planService.updateForecastDetails(
        forecastObject.plan,
        forecastObject
      )

    transactionInstances.push(planTransactionInstance)

    const activePlanInvestments =
      await this.investmentService.getAllAutoRunning(forecastObject.plan)

    for (let index = 0; index < activePlanInvestments.length; index++) {
      try {
        const investmentObject = activePlanInvestments[index]

        const tradeInstances = await this.tradeService.updateStatus(
          investmentObject,
          forecastObject
        )
        tradeInstances.forEach((instance) =>
          transactionInstances.push(instance)
        )
      } catch (error) {
        this.SendMailService.sendDeveloperErrorMail(error)
        continue
      }
    }

    await this.transactionManagerService.execute(transactionInstances)

    return forecastInstance.model
  }

  public async autoUpdateStatus(): Promise<void> {
    const plans = await this.planService.getAllAutoRunning()

    if (!plans.length) return

    for (let index = 0; index < plans.length; index++) {
      const plan = plans[index]

      const totalForecast = plan.dailyForecasts * plan.duration

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
        if (!plan.currentForecast) {
          const error = new Error(
            `There is no current forecast in plan (${plan.name} - ${plan._id})`
          )
          this.SendMailService.sendDeveloperErrorMail(error)
          continue
        }

        await this.updateStatus(plan.currentForecast, ForecastStatus.SETTLED)
      }

      // RUN FORCAST
      else if (forecastStatus === ForecastStatus.PREPARING) {
        if (!plan.currentForecast) {
          const error = new Error(
            `There is no current forecast in plan (${plan.name} - ${plan._id})`
          )
          this.SendMailService.sendDeveloperErrorMail(error)
          continue
        }

        await this.updateStatus(plan.currentForecast, ForecastStatus.RUNNING)
      }

      // CHECK IF FORECAST MARKET HAS CLOSED
      else if (forecastStatus === ForecastStatus.RUNNING) {
        if (!plan.currentForecast) {
          const error = new Error(
            `There is no current forecast in plan (${plan.name} - ${plan._id})`
          )
          this.SendMailService.sendDeveloperErrorMail(error)
          continue
        }
        // LOGIC TO CHECK IF MARKET HAS CLOSED
        // await this.updateStatus(plan.currentForecast, ForecastStatus.MARKET_CLOSED)
      }

      // CHECK IF FORECAST MARKET HAS OPENED
      else if (forecastStatus === ForecastStatus.MARKET_CLOSED) {
        if (!plan.currentForecast) {
          const error = new Error(
            `There is no current forecast in plan (${plan.name} - ${plan._id})`
          )
          this.SendMailService.sendDeveloperErrorMail(error)
          continue
        }
        // LOGIC TO CHECK IF MARKET HAS OPENED
        // await this.updateStatus(plan.currentForecast, ForecastStatus.RUNNING)
      }
    }
  }

  public async manualUpdateStatus(
    forecastId: ObjectId,
    status: ForecastStatus
  ): THttpResponse<{ forecast: IForecast }> {
    const forecast = await this.updateStatus(forecastId, status)

    return {
      status: HttpResponseStatus.SUCCESS,
      message: 'Forecast created successfully',
      data: { forecast },
    }
  }

  public async delete(
    forecastId: ObjectId
  ): THttpResponse<{ forecast: IForecast }> {
    try {
      const forecast = await this.find(forecastId)

      if (forecast.status !== ForecastStatus.SETTLED)
        throw new HttpException(400, 'Forecast has not been settled yet')

      await this.forecastModel.deleteOne({ _id: forecast._id })

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Forecast deleted successfully',
        data: { forecast },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to delete this forecast, please try again'
      )
    }
  }

  public async fetchAll(
    planId: ObjectId
  ): THttpResponse<{ forecasts: IForecast[] }> {
    try {
      let forecasts

      forecasts = await this.forecastModel
        .find({ plan: planId })
        .select('-planObject -pairObject')
        .populate('plan')
        .populate('pair')

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Forecast fetched successfully',
        data: { forecasts },
      }
    } catch (err: any) {
      throw new AppException(err, 'Failed to fetch forecast, please try again')
    }
  }
}

export default ForecastService
