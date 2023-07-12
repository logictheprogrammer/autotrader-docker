import { AssetType } from '@/modules/asset/asset.enum'
import { Inject, Service } from 'typedi'
import PlanModel from '@/modules/plan/plan.model'
import { IPlan, IPlanObject, IPlanService } from '@/modules/plan/plan.interface'
import { Types } from 'mongoose'
import ServiceQuery from '@/modules/service/service.query'
import ServiceException from '@/modules/service/service.exception'
import HttpException from '@/modules/http/http.exception'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import ServiceToken from '@/utils/enums/serviceToken'
import { IAssetService } from '@/modules/asset/asset.interface'
import { PlanStatus } from '@/modules/plan/plan.enum'
import { UserRole } from '@/modules/user/user.enum'

@Service()
class PlanService implements IPlanService {
  private planModel = new ServiceQuery<IPlan>(PlanModel)

  public constructor(
    @Inject(ServiceToken.ASSET_SERVICE)
    private assetService: IAssetService
  ) {}

  private async find(
    planId: Types.ObjectId,
    fromAllAccounts: boolean = true,
    userId?: Types.ObjectId
  ): Promise<IPlan> {
    const plan = await this.planModel.findById(planId, fromAllAccounts, userId)

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
    assets: Types.ObjectId[]
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

      const plan = await this.planModel.self.create({
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
      throw new ServiceException(
        err,
        'Failed to create this plan, please try again'
      )
    }
  }

  public async update(
    planId: Types.ObjectId,
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
    assets: Types.ObjectId[]
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

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Plan has been updated successfully',
        data: { plan },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to create this plan, please try again'
      )
    }
  }

  public async updateStatus(
    planId: Types.ObjectId,
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
      throw new ServiceException(
        err,
        'Failed to update plan status, please try again'
      )
    }
  }

  public async get(planId: Types.ObjectId): Promise<IPlanObject | null> {
    const plan = await this.planModel.self.findById(planId)

    if (!plan) return null

    const assetsObj = []

    for (const assetId of plan.assets) {
      const asset = await this.assetService.get(assetId, plan.assetType)
      if (asset) assetsObj.push(asset)
    }

    plan.assets = assetsObj

    return plan.toObject()
  }

  public async delete(planId: Types.ObjectId): THttpResponse<{ plan: IPlan }> {
    try {
      const plan = await this.planModel.self.findByIdAndDelete(planId)
      if (!plan) throw new HttpException(404, 'Plan not found')
      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Plan has been deleted successfully',
        data: { plan },
      }
    } catch (err: any) {
      throw new ServiceException(err, 'Failed to delete plan, please try again')
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
      throw new ServiceException(err, 'Failed to fetch plans, please try again')
    }
  }
}

export default PlanService
