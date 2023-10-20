import { ICurrencyService } from '@/modules/currency/currency.interface'
import { Inject, Service } from 'typedi'
import { Router, Response } from 'express'
import validate from '@/modules/currency/currency.validation'
import { UserRole } from '@/modules/user/user.enum'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessCreatedResponse, SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'
import { IController } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'

@Service()
class CurrencyController implements IController {
  public path = '/currency'
  public router = Router()

  constructor(
    @Inject(ServiceToken.CURRENCY_SERVICE)
    private currencyService: ICurrencyService
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

    this.router.get(
      `${this.path}`,
      routePermission(UserRole.ADMIN),
      this.fetchAll
    )
  }

  private fetchAll = asyncHandler(
    async (req, res): Promise<Response | void> => {
      const currencies = await this.currencyService.fetchAll({})
      return new SuccessResponse('Currencies fetched successfully', {
        currencies,
      }).send(res)
    }
  )

  private create = asyncHandler(async (req, res): Promise<Response | void> => {
    const { name, symbol, logo } = req.body
    const currency = await this.currencyService.create(name, symbol, logo)
    return new SuccessCreatedResponse('Currency created succesfully', {
      currency,
    }).send(res)
  })
}

export default CurrencyController
