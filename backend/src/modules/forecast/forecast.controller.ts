import { IForecastService } from '@/modules/forecast/forecast.interface'
import { Inject, Service } from 'typedi'
import { Response } from 'express'
import validate from '@/modules/forecast/forecast.validation'
import { UserRole } from '@/modules/user/user.enum'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessCreatedResponse, SuccessResponse } from '@/core/apiResponse'
import { IController, IControllerRoute } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'
import { ApiError, InternalError } from '@/core/apiError'
import BaseController from '@/core/baseContoller'

@Service()
class ForecastController extends BaseController implements IController {
  public path = '/forecast'

  public routes: IControllerRoute[] = [
    [
      'get',
      `${this.path}/plan/:planId`,
      routePermission(UserRole.USER),
      (...params) => this.fetchAll(...params),
    ],
    [
      'post',
      `/master${this.path}/create`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.create),
      (...params) => this.create(...params),
    ],
    [
      'put',
      `/master${this.path}/update/:forecastId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.update),
      (...params) => this.update(...params),
    ],
    [
      'patch',
      `/master${this.path}/update-status/:forecastId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updateStatus),
      (...params) => this.updateStatus(...params),
    ],
    [
      'delete',
      `/master${this.path}/delete/:forecastId`,
      routePermission(UserRole.ADMIN),
      (...params) => this.delete(...params),
    ],
  ]

  constructor(
    @Inject(ServiceToken.FORECAST_SERVICE)
    private forecastService: IForecastService
  ) {
    super()
    this.initialiseRoutes()
  }

  private fetchAll = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const { planId } = req.params
      const forecasts = await this.forecastService.fetchAll({ plan: planId })
      return new SuccessResponse('Forecasts fetched successfully', {
        forecasts,
      }).send(res)
    }
  )

  private create = asyncHandler(async (req, res): Promise<Response | void> => {
    const { stakeRate, pairId, planId, mode } = req.body
    const { forecast, errors } = await this.forecastService.manualCreate(
      planId,
      pairId,
      stakeRate,
      mode
    )

    errors.forEach(
      (err) => err instanceof InternalError && ApiError.notifyDeveloper(err)
    )

    if (errors.length) throw errors[0]

    return new SuccessCreatedResponse('Forecast created successfully', {
      forecast,
    }).send(res)
  })

  private update = asyncHandler(async (req, res): Promise<Response | void> => {
    const {
      percentageProfit,
      stakeRate,
      move,
      openingPrice,
      closingPrice,
      pairId,
    } = req.body

    const { forecastId } = req.params

    const { forecast, errors } = await this.forecastService.update(
      { _id: forecastId },
      pairId,
      stakeRate,
      percentageProfit,
      move,
      openingPrice,
      closingPrice
    )

    errors.forEach(
      (err) => err instanceof InternalError && ApiError.notifyDeveloper(err)
    )

    if (errors.length) throw errors[0]

    return new SuccessResponse('Forecast updated successfully', {
      forecast,
    }).send(res)
  })

  private updateStatus = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const { status, percentageProfit } = req.body
      const { forecastId } = req.params
      const { forecast, errors } =
        await this.forecastService.manualUpdateStatus(
          { _id: forecastId },
          status,
          percentageProfit
        )

      errors.forEach(
        (err) => err instanceof InternalError && ApiError.notifyDeveloper(err)
      )

      if (errors.length) throw errors[0]

      return new SuccessResponse('Status updated successfully', {
        forecast,
      }).send(res)
    }
  )

  private delete = asyncHandler(async (req, res): Promise<Response | void> => {
    const forecastId = req.params.forecastId
    const forecast = await this.forecastService.delete({ _id: forecastId })
    return new SuccessResponse('Forecast deleted successfully', {
      forecast,
    }).send(res)
  })
}

export default ForecastController
