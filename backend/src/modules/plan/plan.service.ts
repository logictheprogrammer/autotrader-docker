import { AssetType } from '@/modules/asset/asset.enum'
import { Inject, Service } from 'typedi'
import planModel from '@/modules/plan/plan.model'
import { IPlan, IPlanObject, IPlanService } from '@/modules/plan/plan.interface'
import AppException from '@/modules/app/app.exception'
import HttpException from '@/modules/http/http.exception'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import ServiceToken from '@/utils/enums/serviceToken'
import { IAssetService } from '@/modules/asset/asset.interface'
import { PlanStatus } from '@/modules/plan/plan.enum'
import { UserRole } from '@/modules/user/user.enum'
import Helpers from '@/utils/helpers/helpers'
import { IPair } from '../pair/pair.interface'
import pairModel from '../pair/pair.model'
import { ObjectId } from 'mongoose'
import { IInvestment } from '../investment/investment.interface'
import { IForecastObject } from '../forecast/forecast.interface'
import { TTransaction } from '../transactionManager/transactionManager.type'
import { ITransactionInstance } from '../transactionManager/transactionManager.interface'
import { ForecastStatus } from '../forecast/forecast.enum'
import forecastModel from '../forecast/forecast.model'

@Service()
class PlanService implements IPlanService {
  private planModel = planModel
  private forecastModel = forecastModel

  public constructor(
    @Inject(ServiceToken.ASSET_SERVICE)
    private assetService: IAssetService
  ) {}

  private async find(
    planId: ObjectId,
    fromAllAccounts: boolean = true,
    userId?: ObjectId
  ): Promise<IPlan> {
    let plan
    if (fromAllAccounts) {
      plan = await this.planModel.findById(planId)
    } else {
      plan = await this.planModel.findOne({ _id: planId, user: userId })
    }

    if (!plan) throw new HttpException(404, 'Plan not found')

    return plan
  }

  public async _updateForecastDetails(
    planId: ObjectId,
    forecastObject: IForecastObject
  ): TTransaction<IPlanObject, IPlan> {
    const plan = await this.find(planId)

    const oldStatus = plan.forecastStatus
    const oldCurrentForecast = plan.currentForecast
    const oldTimeStamps = plan.forecastTimeStamps.slice()
    const oldStartTime = plan.forecastStartTime
    const oldRuntime = plan.runTime

    plan.currentForecast = forecastObject._id
    plan.forecastStatus = forecastObject.status
    plan.forecastTimeStamps = forecastObject.timeStamps.slice()
    plan.forecastStartTime = forecastObject.startTime

    if (forecastObject.status === ForecastStatus.SETTLED) {
      plan.forecastStatus = undefined
      plan.forecastStartTime = undefined
      plan.currentForecast = undefined
      plan.runTime += forecastObject.runTime
    }

    return {
      object: plan.toObject({ getters: true }),
      instance: {
        model: plan,
        onFailed: `Set the plan with an id of (${
          plan._id
        }) forecastStartTime to (${oldStartTime}) and forecastTimeStamps to (${JSON.stringify(
          oldTimeStamps
        )}) and ForecastStatus to (${oldStartTime}) and currentForecast to (${oldCurrentForecast}) and runTime = (${oldRuntime})`,
        callback: async () => {
          plan.currentForecast = oldCurrentForecast
          plan.forecastStatus = oldStatus
          plan.forecastTimeStamps = oldTimeStamps
          plan.forecastStartTime = oldStartTime
          plan.runTime = oldRuntime

          await plan.save()
        },
      },
    }
  }

  public async create(
    icon: string,
    name: string,
    engine: string,
    minAmount: number,
    maxAmount: number,
    minPercentageProfit: number,
    maxPercentageProfit: number,
    duration: number,
    dailyForecasts: number,
    gas: number,
    description: string,
    assetType: AssetType,
    assets: ObjectId[]
  ): THttpResponse<{ plan: IPlan }> {
    try {
      for (const assetId of assets) {
        const assetExist = await this.assetService.get(assetId, assetType)

        if (!assetExist)
          throw new HttpException(
            404,
            'Some of the selected assets those not exist'
          )
      }

      const plan = await this.planModel.create({
        icon,
        name,
        engine,
        minAmount,
        maxAmount,
        minPercentageProfit,
        maxPercentageProfit,
        duration,
        dailyForecasts,
        gas,
        description,
        assetType,
        assets,
      })

      const assetsObj = []

      for (const assetId of plan.assets) {
        const asset = await this.assetService.get(assetId, assetType)
        if (asset) assetsObj.push(asset)
      }

      plan.assets = assetsObj

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Plan has been created successfully',
        data: { plan },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to create this plan, please try again'
      )
    }
  }

  public async update(
    planId: ObjectId,
    icon: string,
    name: string,
    engine: string,
    minAmount: number,
    maxAmount: number,
    minPercentageProfit: number,
    maxPercentageProfit: number,
    duration: number,
    dailyForecasts: number,
    gas: number,
    description: string,
    assetType: AssetType,
    assets: ObjectId[]
  ): THttpResponse<{ plan: IPlan }> {
    try {
      for (const assetId of assets) {
        const assetExist = await this.assetService.get(assetId, assetType)

        if (!assetExist)
          throw new HttpException(
            404,
            'Some of the selected assets those not exist'
          )
      }

      const plan = await this.find(planId)

      plan.name = name
      plan.icon = icon
      plan.engine = engine
      plan.minAmount = minAmount
      plan.maxAmount = maxAmount
      plan.minPercentageProfit = minPercentageProfit
      plan.maxPercentageProfit = maxPercentageProfit
      plan.duration = duration
      plan.dailyForecasts = dailyForecasts
      plan.gas = gas
      plan.description = description
      plan.assetType = assetType
      plan.assets = assets

      const assetsObj = []

      for (const assetId of plan.assets) {
        const asset = await this.assetService.get(assetId, assetType)
        if (asset) assetsObj.push(asset)
      }

      plan.assets = assetsObj

      await plan.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Plan has been updated successfully',
        data: { plan },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to create this plan, please try again'
      )
    }
  }

  public async updateStatus(
    planId: ObjectId,
    status: PlanStatus
  ): THttpResponse<{ plan: IPlan }> {
    try {
      const plan = await this.find(planId)

      plan.status = status

      await plan.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Plan status has been updated successfully',
        data: { plan },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to update plan status, please try again'
      )
    }
  }

  public async updateForecastDetails(
    planId: ObjectId,
    forecastObject: IForecastObject
  ): Promise<ITransactionInstance<IPlan>> {
    return (await this._updateForecastDetails(planId, forecastObject)).instance
  }

  public async get(planId: ObjectId): Promise<IPlanObject | null> {
    const plan = await this.planModel.findById(planId)

    if (!plan) return null

    const assetsObj = []

    for (const assetId of plan.assets) {
      const asset = await this.assetService.get(assetId, plan.assetType)
      if (asset) assetsObj.push(asset)
    }

    plan.assets = assetsObj

    return plan.toObject({ getters: true })
  }

  public async getAllAutoIdled(): Promise<IPlanObject[]> {
    const plans = await this.planModel.find({
      manualMode: false,
      status: PlanStatus.ACTIVE,
      forecastStatus: { $or: [ForecastStatus.SETTLED, undefined] },
    })

    for (let index = 0; index < plans.length; index++) {
      const plan = plans[index]
      const assetsObj = []

      for (const assetId of plan.assets) {
        const asset = await this.assetService.get(assetId, plan.assetType)
        if (asset) assetsObj.push(asset)
      }

      plan.assets = assetsObj

      plan.toObject({ getters: true })
    }

    return plans
  }

  public async getAllAutoRunning(): Promise<IPlanObject[]> {
    const plans = await this.planModel.find({
      manualMode: false,
      status: PlanStatus.ACTIVE,
      forecastStatus: {
        $or: [
          ForecastStatus.PREPARING,
          ForecastStatus.RUNNING,
          ForecastStatus.MARKET_CLOSED,
        ],
      },
    })

    for (let index = 0; index < plans.length; index++) {
      const plan = plans[index]
      const assetsObj = []

      for (const assetId of plan.assets) {
        const asset = await this.assetService.get(assetId, plan.assetType)
        if (asset) assetsObj.push(asset)
      }

      plan.assets = assetsObj

      plan.toObject({ getters: true })
    }

    return plans
  }

  public async delete(planId: ObjectId): THttpResponse<{ plan: IPlan }> {
    try {
      const plan = await this.planModel.findByIdAndDelete(planId)
      if (!plan) throw new HttpException(404, 'Plan not found')

      await this.forecastModel.deleteMany({ plan: plan._id })
      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Plan has been deleted successfully',
        data: { plan },
      }
    } catch (err: any) {
      throw new AppException(err, 'Failed to delete plan, please try again')
    }
  }

  public async fetchAll(role: UserRole): THttpResponse<{ plans: IPlan[] }> {
    try {
      let plans
      if (role > UserRole.USER) {
        plans = await this.planModel.find()
      } else {
        plans = await this.planModel.find({
          status: { $ne: PlanStatus.SUSPENDED },
        })
      }

      for (const plan of plans) {
        const assetsObj = []

        for (const assetId of plan.assets) {
          const asset = await this.assetService.get(assetId, plan.assetType)
          if (asset) assetsObj.push(asset)
        }

        plan.assets = assetsObj
      }

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Plans fetched successfully',
        data: { plans },
      }
    } catch (err: any) {
      throw new AppException(err, 'Failed to fetch plans, please try again')
    }
  }
}

export default PlanService
