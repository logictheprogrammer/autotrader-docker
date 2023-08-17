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
import AppRepository from '../app/app.repository'
import AppObjectId from '../app/app.objectId'

@Service()
class PlanService implements IPlanService {
  private planRepository = new AppRepository<IPlan>(planModel)

  public constructor(
    @Inject(ServiceToken.ASSET_SERVICE)
    private assetService: IAssetService
  ) {}

  private async find(
    planId: AppObjectId,
    fromAllAccounts: boolean = true,
    userId?: AppObjectId
  ): Promise<IPlan> {
    const plan = await this.planRepository
      .findById(planId, fromAllAccounts, userId)
      .collect()

    if (!plan) throw new HttpException(404, 'Plan not found')

    return plan
  }

  public async create(
    icon: string,
    name: string,
    engine: string,
    minAmount: number,
    maxAmount: number,
    minProfit: number,
    maxProfit: number,
    duration: number,
    dailyTrades: number,
    gas: number,
    description: string,
    assetType: AssetType,
    assets: AppObjectId[]
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

      const plan = await this.planRepository
        .create({
          icon,
          name,
          engine,
          minAmount,
          maxAmount,
          minProfit,
          maxProfit,
          duration,
          dailyTrades,
          gas,
          description,
          assetType,
          assets,
        })
        .save()

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
    planId: AppObjectId,
    icon: string,
    name: string,
    engine: string,
    minAmount: number,
    maxAmount: number,
    minProfit: number,
    maxProfit: number,
    duration: number,
    dailyTrades: number,
    gas: number,
    description: string,
    assetType: AssetType,
    assets: AppObjectId[]
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
      plan.minProfit = minProfit
      plan.maxProfit = maxProfit
      plan.duration = duration
      plan.dailyTrades = dailyTrades
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

      await this.planRepository.save(plan)

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
    planId: AppObjectId,
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

  public async get(planId: AppObjectId): Promise<IPlanObject | null> {
    const plan = await this.planRepository.findById(planId).collect()

    if (!plan) return null

    const assetsObj = []

    for (const assetId of plan.assets) {
      const asset = await this.assetService.get(assetId, plan.assetType)
      if (asset) assetsObj.push(asset)
    }

    plan.assets = assetsObj

    return this.planRepository.toObject(plan)
  }

  public async delete(planId: AppObjectId): THttpResponse<{ plan: IPlan }> {
    try {
      const plan = await this.planRepository.findByIdAndDelete(planId)
      if (!plan) throw new HttpException(404, 'Plan not found')
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
        plans = await this.planRepository.find().collectAll()
      } else {
        plans = await this.planRepository
          .find({
            status: { $ne: PlanStatus.SUSPENDED },
          })
          .collectAll()
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
