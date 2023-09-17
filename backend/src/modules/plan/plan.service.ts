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

@Service()
class PlanService implements IPlanService {
  private planModel = planModel
  private pairModel = pairModel

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
      throw new AppException(
        err,
        'Failed to create this plan, please try again'
      )
    }
  }

  // public async autoTrade(): Promise<void> {
  //   const runningPlans = await this.planModel
  //     .find({
  //       investors: { $exists: true, $ne: [] },
  //     })
  //     .populate('pairs')

  //   for (const plan of runningPlans) {
  //     // get pair
  //   }

  //   const investment = await this.investmentService.get(investmentId)
  //   const pair = await this.pairService.get(pairId)
  //   const user = await this.userService.get(investment.user)

  //   if (!pair) throw new HttpException(404, 'The selected pair no longer exist')

  //   if (pair.assetType !== investment.planObject.assetType)
  //     throw new HttpException(
  //       400,
  //       'The pair is not compatible with this investment plan'
  //     )

  //   const minProfit =
  //     investment.planObject.minProfit /
  //     (investment.planObject.dailyTrades * investment.planObject.duration)
  //   const maxProfit =
  //     investment.planObject.maxProfit /
  //     (investment.planObject.dailyTrades * investment.planObject.duration)

  //   const stakeRate = Helpers.getRandomValue(
  //     TradeService.minStakeRate,
  //     TradeService.maxStakeRate
  //   )

  //   const spread = stakeRate * minProfit

  //   const breakpoint = spread * TradeService.profitBreakpoint

  //   const investmentPercentage = this.mathService.dynamicRange(
  //     minProfit,
  //     maxProfit,
  //     spread,
  //     breakpoint,
  //     TradeService.profitProbability
  //   )

  //   const { model: trade } = (
  //     await this.create(user, investment, pair, stakeRate, investmentPercentage)
  //   ).instance

  //   await trade.save()

  //   return {
  //     status: HttpResponseStatus.SUCCESS,
  //     message: 'Trade created successfully',
  //     data: { trade: trade.collectRaw() },
  //   }
  // }

  public async update(
    planId: ObjectId,
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

  public async delete(planId: ObjectId): THttpResponse<{ plan: IPlan }> {
    try {
      const plan = await this.planModel.findByIdAndDelete(planId)
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
