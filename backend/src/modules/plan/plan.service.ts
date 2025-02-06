import { AssetType } from '@/modules/asset/asset.enum'
import { Inject, Service } from 'typedi'
import { IPlan, IPlanObject, IPlanService } from '@/modules/plan/plan.interface'
import { IAssetService } from '@/modules/asset/asset.interface'
import { PlanStatus } from '@/modules/plan/plan.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import ServiceToken from '@/core/serviceToken'
import { NotFoundError } from '@/core/apiError'
import PlanModel from '@/modules/plan/plan.model'

@Service()
class PlanService implements IPlanService {
  private planModel = PlanModel

  public constructor(
    @Inject(ServiceToken.ASSET_SERVICE)
    private assetService: IAssetService
  ) {}

  public async create(
    icon: string,
    name: string,
    engine: string,
    duration: number,
    minAmount: number,
    maxAmount: number,
    dailyPercentageProfit: number,
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
      duration,
      minAmount,
      maxAmount,
      dailyPercentageProfit,
      potentialPercentageProfit: dailyPercentageProfit * duration,
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
    duration: number,
    minAmount: number,
    maxAmount: number,
    dailyPercentageProfit: number,
    description: string,
    assetType: AssetType,
    assets: ObjectId[]
  ): Promise<IPlanObject> {
    const plan = await this.planModel.findOne(filter).populate('assets')

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
    plan.duration = duration
    plan.minAmount = minAmount
    plan.maxAmount = maxAmount
    plan.dailyPercentageProfit = dailyPercentageProfit
    plan.potentialPercentageProfit = dailyPercentageProfit * duration
    plan.description = description
    plan.assetType = assetType
    plan.assets = assetsArr

    await plan.save()

    return plan
  }

  public async updateStatus(
    filter: FilterQuery<IPlan>,
    status: PlanStatus
  ): Promise<IPlanObject> {
    const plan = await this.planModel.findOne(filter).populate('assets')

    if (!plan) throw new NotFoundError('Plan not found')

    plan.status = status

    await plan.save()

    return plan
  }

  public async fetch(filter: FilterQuery<IPlan>): Promise<IPlanObject> {
    const plan = await this.planModel.findOne(filter).populate('assets')

    if (!plan) throw new NotFoundError('Plan not found')

    return plan
  }

  public async count(filter: FilterQuery<IPlan>): Promise<number> {
    return await this.planModel.count(filter)
  }

  public async delete(filter: FilterQuery<IPlan>): Promise<IPlanObject> {
    const plan = await this.planModel.findOneAndDelete(filter)
    if (!plan) throw new NotFoundError('Plan not found')

    return plan
  }

  public async fetchAll(filter: FilterQuery<IPlan>): Promise<IPlanObject[]> {
    return await this.planModel.find(filter).populate('assets')
  }
}

export default PlanService
