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
    this.router.post(
      `${this.path}/create/:planId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.create),
      this.create
    )

    this.router.put(
      `${this.path}/update/:forecastId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.update),
      this.update
    )

    this.router.put(
      `${this.path}/update-status/:forecastId`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.updateStatus),
      this.updateStatus
    )

    this.router.delete(
      `${this.path}/delete/:forecastId`,
      routePermission(UserRole.ADMIN),
      this.delete
    )

    this.router.get(
      `${this.path}`,
      routePermission(UserRole.USER),
      this.fetchAll
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
    const { percentageProfit, stakeRate, pairId } = req.body
    const { planId } = req.params
    const { forecast, errors } = await this.forecastService.manualCreate(
      planId as unknown as ObjectId,
      pairId,
      percentageProfit,
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
      forecastId as unknown as ObjectId,
      pairId,
      percentageProfit,
      stakeRate,
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
      const { status } = req.body
      const { forecastId } = req.params
      const { forecast, errors } =
        await this.forecastService.manualUpdateStatus(
          forecastId as unknown as ObjectId,
          status
        )

      errors.forEach((err) => ApiError.notifyDeveloper(err))

      return new SuccessResponse('Status updated successfully', {
        forecast,
      }).send(res)
    }
  )

  private delete = asyncHandler(async (req, res): Promise<Response | void> => {
    const forecastId = req.params.forecastId as unknown as ObjectId
    const forecast = await this.forecastService.delete(forecastId)
    return new SuccessResponse('Forecast deleted successfully', {
      forecast,
    }).send(res)
  })
}

export default ForecastController
