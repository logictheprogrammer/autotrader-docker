import { IInvestmentService } from '@/modules/investment/investment.interface'
import { Inject, Service } from 'typedi'
import { Response } from 'express'
import validate from '@/modules/investment/investment.validation'
import { UserEnvironment, UserRole } from '@/modules/user/user.enum'
import { ObjectId } from 'mongoose'
import { SuccessCreatedResponse, SuccessResponse } from '@/core/apiResponse'
import asyncHandler from '@/helpers/asyncHandler'
import { IController, IControllerRoute } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'
import BaseController from '@/core/baseContoller'

@Service()
class InvestmentController extends BaseController implements IController {
  public path = '/investment'
  public routes: IControllerRoute[] = [
    [
      'get',
      `${this.path}`,
      routePermission(UserRole.USER),
      (...params) => this.fetchAll(false, UserEnvironment.LIVE)(...params),
    ],
    [
      'post',
      `${this.path}/create`,
      routePermission(UserRole.USER),
      schemaValidator(validate.create),
      (...params) => this.create(UserEnvironment.LIVE)(...params),
    ],
    [
      'get',
      `/demo${this.path}`,
      routePermission(UserRole.USER),
      (...params) => this.fetchAll(false, UserEnvironment.DEMO)(...params),
    ],
    [
      'post',
      `/demo${this.path}/create`,
      routePermission(UserRole.USER),
      schemaValidator(validate.createDemo),
      (...params) => this.create(UserEnvironment.DEMO)(...params),
    ],
    [
      'patch',
      `/master${this.path}/fund/:investmentId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.fund),
      (...params) => this.fund(...params),
    ],
    [
      'patch',
      `/master${this.path}/refill/:investmentId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.refill),
      (...params) => this.refill(...params),
    ],
    [
      'patch',
      `/master${this.path}/update-status/:investmentId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updateStatus),
      (...params) => this.updateStatus(...params),
    ],
    [
      'delete',
      `/master${this.path}/delete/:investmentId`,
      routePermission(UserRole.ADMIN),
      (...params) => this.delete(...params),
    ],
    [
      'get',
      `/master/demo${this.path}`,
      routePermission(UserRole.ADMIN),
      (...params) => this.fetchAll(true, UserEnvironment.DEMO)(...params),
    ],
    [
      'get',
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      (...params) => this.fetchAll(true, UserEnvironment.LIVE)(...params),
    ],
  ]

  constructor(
    @Inject(ServiceToken.INVESTMENT_SERVICE)
    private investmentService: IInvestmentService
  ) {
    super()
    this.initialiseRoutes()
  }

  private intialiseRoutes(): void {
    this.router.get(
      `${this.path}`,
      routePermission(UserRole.USER),
      this.fetchAll(false, UserEnvironment.LIVE)
    )

    this.router.post(
      `${this.path}/create`,
      routePermission(UserRole.USER),
      schemaValidator(validate.create),
      this.create(UserEnvironment.LIVE)
    )

    this.router.get(
      `/demo${this.path}`,
      routePermission(UserRole.USER),
      this.fetchAll(false, UserEnvironment.DEMO)
    )

    this.router.post(
      `/demo${this.path}/create`,
      routePermission(UserRole.USER),
      schemaValidator(validate.createDemo),
      this.create(UserEnvironment.DEMO)
    )

    this.router.patch(
      `/master${this.path}/fund/:investmentId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.fund),
      this.fund
    )

    this.router.patch(
      `/master${this.path}/refill/:investmentId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.refill),
      this.refill
    )

    this.router.patch(
      `/master${this.path}/update-status/:investmentId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updateStatus),
      this.updateStatus
    )

    this.router.delete(
      `/master${this.path}/delete/:investmentId`,
      routePermission(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `/master/demo${this.path}`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.DEMO)
    )

    this.router.get(
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      this.fetchAll(true, UserEnvironment.LIVE)
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
      const { amount, account, planId } = req.body
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

  private refill = asyncHandler(async (req, res): Promise<Response | void> => {
    const { gas } = req.body
    const { investmentId } = req.params
    const investment = await this.investmentService.refill(
      { _id: investmentId },
      gas
    )
    return new SuccessResponse('Investment has been refilled successfully', {
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
