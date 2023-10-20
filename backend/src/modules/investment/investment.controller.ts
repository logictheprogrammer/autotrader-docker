import { IInvestmentService } from '@/modules/investment/investment.interface'
import { Inject, Service } from 'typedi'
import { Router, Response } from 'express'
import validate from '@/modules/investment/investment.validation'
import { UserEnvironment, UserRole } from '@/modules/user/user.enum'
import { ObjectId } from 'mongoose'
import { SuccessCreatedResponse, SuccessResponse } from '@/core/apiResponse'
import asyncHandler from '@/helpers/asyncHandler'
import { IController } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'

@Service()
class InvestmentController implements IController {
  public path = '/investment'
  public router = Router()

  constructor(
    @Inject(ServiceToken.INVESTMENT_SERVICE)
    private investmentService: IInvestmentService
  ) {
    this.intialiseRoutes()
  }

  private intialiseRoutes(): void {
    this.router.post(
      `${this.path}/create/:planId`,
      routePermission(UserRole.USER),
      schemaValidator(validate.create),
      this.create(UserEnvironment.LIVE)
    )

    this.router.post(
      `${this.path}/demo/create/:planId`,
      routePermission(UserRole.USER),
      schemaValidator(validate.createDemo),
      this.create(UserEnvironment.DEMO)
    )

    this.router.patch(
      `${this.path}/fund/:investmentId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.fund),
      this.fund
    )

    this.router.patch(
      `${this.path}/update-status/:investmentId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updateStatus),
      this.updateStatus
    )

    this.router.delete(
      `${this.path}/delete/:investmentId`,
      routePermission(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `${this.path}/master/demo`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.DEMO)
    )

    this.router.get(
      `${this.path}/master`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.LIVE)
    )

    this.router.get(
      `${this.path}/demo`,
      routePermission(UserRole.USER),
      this.fetchAll(false, UserEnvironment.DEMO)
    )

    this.router.get(
      `${this.path}`,
      routePermission(UserRole.USER),
      this.fetchAll(false, UserEnvironment.LIVE)
    )
  }

  private fetchAll = (all: boolean, environment: UserEnvironment) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      const userId = req.user._id
      let investments
      if (all) {
        investments = await this.investmentService.fetchAll({ environment })
      } else {
        investments = await this.investmentService.fetchAll({
          environment,
          user: userId,
        })
      }

      return new SuccessResponse('Investments fetched successfully', {
        investments,
      }).send(res)
    })

  private create = (environment: UserEnvironment) =>
    asyncHandler(async (req, res): Promise<Response | void> => {
      const { amount, account } = req.body
      const { planId } = req.params
      const userId = req.user._id
      const investment = await this.investmentService.create(
        planId as unknown as ObjectId,
        userId,
        amount,
        account,
        environment
      )
      return new SuccessCreatedResponse('Investment registered successfully', {
        investment,
      }).send(res)
    })

  private updateStatus = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const { status } = req.body
      const { investmentId } = req.params
      const investment = await this.investmentService.updateStatus(
        { _id: investmentId },
        status
      )
      return new SuccessResponse('Status updated successfully', {
        investment,
      }).send(res)
    }
  )

  private fund = asyncHandler(async (req, res): Promise<Response | void> => {
    const { amount } = req.body
    const { investmentId } = req.params
    const investment = await this.investmentService.fund(
      { _id: investmentId },
      amount
    )
    return new SuccessResponse('Investment funded successfully', {
      investment,
    }).send(res)
  })

  private delete = asyncHandler(async (req, res): Promise<Response | void> => {
    const investmentId = req.params.investmentId as unknown as ObjectId
    const investment = await this.investmentService.delete({
      _id: investmentId,
    })
    return new SuccessResponse('Investment deleted successfully', {
      investment,
    }).send(res)
  })
}

export default InvestmentController
