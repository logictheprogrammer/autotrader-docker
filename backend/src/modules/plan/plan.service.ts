import { AssetType } from '@/modules/asset/asset.enum'
import { Inject, Service } from 'typedi'
import { IPlan, IPlanObject, IPlanService } from '@/modules/plan/plan.interface'
import { IAssetService } from '@/modules/asset/asset.interface'
import { PlanStatus } from '@/modules/plan/plan.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import { IForecastObject } from '../forecast/forecast.interface'
import { ForecastStatus } from '../forecast/forecast.enum'
import ServiceToken from '@/core/serviceToken'
import { NotFoundError, ServiceError } from '@/core/apiError'
import PlanModel from '@/modules/plan/plan.model'
import ForecastModel from '../forecast/forecast.model'

@Service()
class PlanService implements IPlanService {
  private planModel = PlanModel
  private forecastModel = ForecastModel

  public constructor(
    @Inject(ServiceToken.ASSET_SERVICE)
    private assetService: IAssetService
  ) {}

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
  ): Promise<IPlanObject> {
    try {
      const assetsArr = []
      for (const assetId of assets) {
        let assetExist
        try {
          assetExist = await this.assetService.fetch({
            _id: assetId,
            type: assetType,
          })
        } catch (error) {
          if (!(error instanceof NotFoundError)) {
            throw error
          }
        }

        if (!assetExist)
          throw new NotFoundError('Some of the selected assets those not exist')

        assetsArr.push(assetExist)
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
        assets: assetsArr,
      })

      return plan.populate('assets')
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to create this plan, please try again'
      )
    }
  }

  public async update(
    filter: FilterQuery<IPlan>,
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
  ): Promise<IPlanObject> {
    try {
      const plan = await this.planModel.findOne(filter)

      if (!plan) throw new NotFoundError('Plan not found')

      const assetsArr = []
      for (const assetId of assets) {
        let assetExist
        try {
          assetExist = await this.assetService.fetch({
            _id: assetId,
            type: assetType,
          })
        } catch (error) {
          if (!(error instanceof NotFoundError)) {
            throw error
          }
        }

        if (!assetExist)
          throw new NotFoundError('Some of the selected assets those not exist')

        assetsArr.push(assetExist)
      }

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
      plan.assets = assetsArr

      await plan.save()

      await plan.populate('assets')
      await plan.populate('investors')
      await plan.populate('currentForecast')

      return plan
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to create this plan, please try again'
      )
    }
  }

  public async updateStatus(
    filter: FilterQuery<IPlan>,
    status: PlanStatus
  ): Promise<IPlanObject> {
    try {
      const plan = await this.planModel
        .findOne(filter)
        .populate('assets')
        .populate('investors')
        .populate('currentForecast')

      if (!plan) throw new NotFoundError('Plan not found')

      plan.status = status

      await plan.save()

      return plan
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to update plan status, please try again'
      )
    }
  }

  public async updateForecastDetails(
    filter: FilterQuery<IPlan>,
    forecastObject: IForecastObject
  ): Promise<IPlanObject> {
    const plan = await this.planModel
      .findOne(filter)
      .populate('assets')
      .populate('investors')
      .populate('currentForecast')

    if (!plan) throw new NotFoundError('Plan not found')

    plan.currentForecast = forecastObject
    plan.forecastStatus = forecastObject.status
    plan.forecastTimeStamps = forecastObject.timeStamps.slice()
    plan.forecastStartTime = forecastObject.startTime

    if (forecastObject.status === ForecastStatus.SETTLED) {
      plan.forecastStatus = undefined
      plan.forecastStartTime = undefined
      plan.currentForecast = undefined
      plan.runTime += forecastObject.runTime
    }

    await plan.save()

    return plan
  }

  public async fetch(filter: FilterQuery<IPlan>): Promise<IPlanObject> {
    try {
      const plan = await this.planModel
        .findOne(filter)
        .populate('assets')
        .populate('investors')
        .populate('currentForecast')

      if (!plan) throw new NotFoundError('Plan not found')

      return plan
    } catch (error) {
      throw new ServiceError(error, 'Unable to fetch plan, please try again')
    }
  }

  public async delete(filter: FilterQuery<IPlan>): Promise<IPlanObject> {
    try {
      const plan = await this.planModel.findOneAndDelete(filter)
      if (!plan) throw new NotFoundError('Plan not found')

      await this.forecastModel.deleteMany({ plan: plan._id })
      return plan
    } catch (err: any) {
      throw new ServiceError(err, 'Failed to delete plan, please try again')
    }
  }

  public async fetchAll(filter: FilterQuery<IPlan>): Promise<IPlanObject[]> {
    try {
      return await this.planModel
        .find(filter)
        .populate('assets')
        .populate('investors')
        .populate('currentForecast')
    } catch (err: any) {
      throw new ServiceError(err, 'Failed to fetch plans, please try again')
    }
  }
}

export default PlanService
