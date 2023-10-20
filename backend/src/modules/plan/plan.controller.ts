import { IPlanService } from '@/modules/plan/plan.interface'
import { Inject, Service } from 'typedi'
import { Router, Response } from 'express'
import validate from '@/modules/plan/plan.validation'
import { UserRole } from '@/modules/user/user.enum'
import { PlanStatus } from '@/modules/plan/plan.enum'
import { ObjectId } from 'mongoose'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessCreatedResponse, SuccessResponse } from '@/core/apiResponse'
import { IController } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'

@Service()
class PlanController implements IController {
  public path = '/plans'
  public router = Router()

  constructor(
    @Inject(ServiceToken.PLAN_SERVICE)
    private planService: IPlanService
  ) {
    this.intialiseRoutes()
  }

  private intialiseRoutes(): void {
    this.router.post(
      `${this.path}/create`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.create),
      this.create
    )

    this.router.put(
      `${this.path}/update/:planId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.update),
      this.update
    )

    this.router.patch(
      `${this.path}/update-status/:planId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updateStatus),
      this.updateStatus
    )

    this.router.delete(
      `${this.path}/delete/:planId`,
      routePermission(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `${this.path}/master`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true)
    )

    this.router.get(
      `${this.path}`,
      routePermission(UserRole.USER),
      this.fetchAll(false)
    )
  }

  private create = asyncHandler(async (req, res): Promise<Response | void> => {
    const {
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
    } = req.body

    const assets = req.body.assets as ObjectId[]

    const plan = await this.planService.create(
      'icon.png',
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
      assets
    )
    return new SuccessCreatedResponse('Plan created successfully', {
      plan,
    }).send(res)
  })

  private update = asyncHandler(async (req, res): Promise<Response | void> => {
    const {
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
    } = req.body

    const { planId } = req.params

    const assets = req.body.assets as ObjectId[]

    const plan = await this.planService.update(
      { _id: planId },
      'icon.png',
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
      assets
    )
    return new SuccessResponse('Plan updated successfully', { plan }).send(res)
  })

  private updateStatus = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const { planId } = req.params

      const status = req.body.status as PlanStatus

      const plan = await this.planService.updateStatus({ _id: planId }, status)

      return new SuccessResponse('Status updated successfully', { plan }).send(
        res
      )
    }
  )

  private delete = asyncHandler(async (req, res): Promise<Response | void> => {
    const planId = req.params.planId as unknown as ObjectId

    const plan = await this.planService.delete({ _id: planId })

    return new SuccessResponse('Plan deleted successfully', { plan }).send(res)
  })

  private fetchAll = (byAdmin: boolean) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      let plans

      if (byAdmin) {
        plans = await this.planService.fetchAll({})
      } else {
        plans = await this.planService.fetchAll({
          status: {
            $ne: PlanStatus.SUSPENDED,
          },
        })
      }

      return new SuccessResponse('Plans fetched successfully', { plans }).send(
        res
      )
    })
}

export default PlanController
