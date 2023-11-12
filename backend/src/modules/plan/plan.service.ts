import { AssetType } from '@/modules/asset/asset.enum'
import { Inject, Service } from 'typedi'
import { IPlan, IPlanObject, IPlanService } from '@/modules/plan/plan.interface'
import { IAssetService } from '@/modules/asset/asset.interface'
import { PlanStatus } from '@/modules/plan/plan.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import { IForecastObject } from '../forecast/forecast.interface'
import { ForecastStatus } from '../forecast/forecast.enum'
import ServiceToken from '@/core/serviceToken'
import { NotFoundError } from '@/core/apiError'
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
    winRate: number,
    tradingDays: number,
    dailyForecasts: number,
    gas: number,
    description: string,
    assetType: AssetType,
    assets: ObjectId[]
  ): Promise<IPlanObject> {
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
      winRate,
      tradingDays,
      dailyForecasts,
      gas,
      description,
      assetType,
      assets: assetsArr,
    })

    return plan.populate('assets')
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
    winRate: number,
    tradingDays: number,
    dailyForecasts: number,
    gas: number,
    description: string,
    assetType: AssetType,
    assets: ObjectId[]
  ): Promise<IPlanObject> {
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
    plan.winRate = winRate
    plan.tradingDays = tradingDays
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
  }

  public async updateStatus(
    filter: FilterQuery<IPlan>,
    status: PlanStatus
  ): Promise<IPlanObject> {
    const plan = await this.planModel
      .findOne(filter)
      .populate('assets')
      .populate('investors')
      .populate('currentForecast')

    if (!plan) throw new NotFoundError('Plan not found')

    plan.status = status

    await plan.save()

    return plan
  }

  public async updateForecastDetails(
    filter: FilterQuery<IPlan>,
    forecastObject: IForecastObject | null
  ): Promise<IPlanObject> {
    const plan = await this.planModel
      .findOne(filter)
      .populate('assets')
      .populate('investors')
      .populate('currentForecast')

    if (!plan) throw new NotFoundError('Plan not found')

    if (forecastObject) {
      if (forecastObject.status !== ForecastStatus.SETTLED) {
        plan.currentForecast = forecastObject
        plan.forecastStatus = forecastObject.status
        plan.forecastTimeStamps = forecastObject.timeStamps.slice()
        plan.forecastStartTime = forecastObject.startTime
      } else {
        plan.forecastStatus = undefined
        plan.forecastStartTime = undefined
        plan.currentForecast = undefined
        plan.forecastTimeStamps = []
        plan.runTime += forecastObject.runTime
      }
    } else {
      plan.forecastStatus = undefined
      plan.forecastStartTime = undefined
      plan.currentForecast = undefined
      plan.forecastTimeStamps = []
    }

    await plan.save()

    return plan
  }

  public async fetch(filter: FilterQuery<IPlan>): Promise<IPlanObject> {
    const plan = await this.planModel
      .findOne(filter)
      .populate('assets')
      .populate('investors')
      .populate('currentForecast')

    if (!plan) throw new NotFoundError('Plan not found')

    return plan
  }

  public async count(filter: FilterQuery<IPlan>): Promise<number> {
    return await this.planModel.count(filter)
  }

  public async delete(filter: FilterQuery<IPlan>): Promise<IPlanObject> {
    const plan = await this.planModel.findOneAndDelete(filter)
    if (!plan) throw new NotFoundError('Plan not found')

    await this.forecastModel.deleteMany({ plan: plan._id })
    return plan
  }

  public async fetchAll(filter: FilterQuery<IPlan>): Promise<IPlanObject[]> {
    return await this.planModel
      .find(filter)
      .populate('assets')
      .populate('investors')
      .populate('currentForecast')
  }
}

export default PlanService
