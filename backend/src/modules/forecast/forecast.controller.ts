import { IForecastService } from '@/modules/forecast/forecast.interface'
import { Inject, Service } from 'typedi'
import { Router, Response } from 'express'
import validate from '@/modules/forecast/forecast.validation'
import { UserRole } from '@/modules/user/user.enum'
import { ObjectId } from 'mongoose'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessCreatedResponse, SuccessResponse } from '@/core/apiResponse'
import { IController } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'
import { ApiError } from '@/core/apiError'

@Service()
class ForecastController implements IController {
  public path = '/forecast'
  public router = Router()

  constructor(
    @Inject(ServiceToken.FORECAST_SERVICE)
    private forecastService: IForecastService
  ) {
    this.intialiseRoutes()
  }

  private intialiseRoutes(): void {
    this.router.get(
      `${this.path}/plan/:planId`,
      routePermission(UserRole.USER),
      this.fetchAll
    )

    this.router.post(
      `/master${this.path}/create`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.create),
      this.create
    )

    this.router.put(
      `/master${this.path}/update/:forecastId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.update),
      this.update
    )

    this.router.patch(
      `/master${this.path}/update-status/:forecastId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updateStatus),
      this.updateStatus
    )

    this.router.delete(
      `/master${this.path}/delete/:forecastId`,
      routePermission(UserRole.ADMIN),
      this.delete
    )
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
    const { stakeRate, pairId, planId } = req.body
    const { forecast, errors } = await this.forecastService.manualCreate(
      planId,
      pairId,
      stakeRate
    )

    errors.forEach((err) => ApiError.notifyDeveloper(err))

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

    const forecast = await this.forecastService.update(
      { _id: forecastId },
      pairId,
      stakeRate,
      percentageProfit,
      move,
      openingPrice,
      closingPrice
    )
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

      errors.forEach((err) => ApiError.notifyDeveloper(err))

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
