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
import { IUser, IUserObject, IUserService } from '@/modules/user/user.interface'
import {
  ITransaction,
  ITransactionService,
} from '@/modules/transaction/transaction.interface'
import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import {
  INotification,
  INotificationService,
} from '@/modules/notification/notification.interface'
import {
  NotificationCategory,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import {
  ITransactionInstance,
  ITransactionManagerService,
} from '@/modules/transactionManager/transactionManager.interface'
import { UserEnvironment } from '@/modules/user/user.enum'
import { THttpResponse } from '@/modules/http/http.type'
import HttpException from '@/modules/http/http.exception'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import AppException from '@/modules/app/app.exception'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { IInvestmentObject } from '../investment/investment.interface'
import { IPair, IPairObject, IPairService } from '../pair/pair.interface'
import Helpers from '@/utils/helpers/helpers'
import { IMathService } from '../math/math.interface'
import { InvestmentStatus } from '../investment/investment.enum'
import { TUpdateForecastStatus } from './forecast.type'
import userModel from '../user/user.model'
import { TUpdateInvestmentStatus } from '../investment/investment.type'
import { ObjectId } from 'mongoose'
import { IAsset } from '../asset/asset.interface'
import { ISendMailService } from '../sendMail/sendMail.interface'
import { ITrade } from '../trade/trade.interface'
import { IReferral } from '../referral/referral.interface'

@Service()
class ForecastService implements IForecastService {
  private forecastModel = forecastModel
  private userModel = userModel

  public static dailyForecasts = 0.1
  public static minStakeRate = 0.1
  public static maxStakeRate = 0.25
  public static percentageProfitBreakpoint = 3
  public static percentageProfitProbability = 0.5

  public constructor(
    @Inject(ServiceToken.PLAN_SERVICE)
    private planService: IPlanService,
    @Inject(ServiceToken.PAIR_SERVICE)
    private pairService: IPairService,
    @Inject(ServiceToken.MATH_SERVICE)
    private mathService: IMathService,
    @Inject(ServiceToken.INVESTMENT_SERVICE)
    private investmentService: IInvestmentService,
    @Inject(ServiceToken.TRANSACTION_SERVICE)
    private transactionService: ITransactionService,
    @Inject(ServiceToken.NOTIFICATION_SERVICE)
    private notificationService: INotificationService,
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
        forecastObject.status,
        forecastObject.timeStamps.slice(),
        forecastObject.startTime
      )

    transactionInstances.push(planTransactionInstance)

    const activePlanInvestments =
      await this.investmentService.getAllAutoAwaiting(forecastObject.plan)

    for (let index = 0; index < activePlanInvestments.length; index++) {
      try {
        const investmentInstances = await this.investmentService.setTrade(
          activePlanInvestments[index]._id,
          forecastObject
        )

        investmentInstances.forEach((instance) =>
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
    const plans = await this.planService.getAllAuto()

    if (!plans.length) return

    for (let index = 0; index < plans.length; index++) {
      const plan = plans[index]

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

      const minPercentageProfit =
        plan.minPercentageProfit / (plan.dailyForecasts * plan.duration)
      const maxPercentageProfit =
        plan.maxPercentageProfit / (plan.dailyForecasts * plan.duration)

      const stakeRate = Helpers.getRandomValue(
        ForecastService.minStakeRate,
        ForecastService.maxStakeRate
      )

      const spread = stakeRate * minPercentageProfit

      const breakpoint = spread * ForecastService.percentageProfitBreakpoint

      const percentageProfit = this.mathService.dynamicRange(
        minPercentageProfit,
        maxPercentageProfit,
        spread,
        breakpoint,
        ForecastService.percentageProfitProbability
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

  public async manualUpdate(
    forecastId: ObjectId,
    pairId: ObjectId,
    percentageProfit: number,
    status: ForecastStatus,
    move?: ForecastMove
  ): THttpResponse<{ forecast: IForecast }> {
    try {
      const forecast = await this.find(forecastId)
      const pair = await this.pairService.get(pairId)
      if (!pair)
        throw new HttpException(404, 'The selected pair no longer exist')

      if (pair.assetType !== forecast.market)
        throw new HttpException(
          400,
          'The pair is not compatible with this forecast'
        )

      forecast.move = move
      forecast.percentageProfit = percentageProfit
      forecast.status = status
      forecast.manualMode = true

      await forecast.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Forecast updated successfully',
        data: { forecast },
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
        forecastObject.status,
        forecastObject.timeStamps.slice(),
        forecastObject.startTime
      )

    transactionInstances.push(planTransactionInstance)

    const activePlanInvestments =
      await this.investmentService.getAllAutoRunning(forecastObject.plan)

    for (let index = 0; index < activePlanInvestments.length; index++) {
      try {
        const investmentInstances = await this.investmentService.setTradeStatus(
          activePlanInvestments[index]._id,
          forecastObject
        )
        investmentInstances.forEach((instance) =>
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
    const plans = await this.planService.getAllAuto()

    if (!plans.length) return

    for (let index = 0; index < plans.length; index++) {
      const plan = plans[index]

      // await this.updateStatus()
    }
  }

  public async delete(
    forecastId: ObjectId
  ): THttpResponse<{ forecast: IForecast }> {
    try {
      const forecast = await this.find(forecastId)

      if (forecast.status !== ForecastStatus.SETTLED)
        throw new HttpException(400, 'Forecast has not been settled yet')

      await forecast.deleteOne()
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
