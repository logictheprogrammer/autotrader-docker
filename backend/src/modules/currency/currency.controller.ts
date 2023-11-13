import { ICurrencyService } from '@/modules/currency/currency.interface'
import { Inject, Service } from 'typedi'
import { Router, Response } from 'express'
import validate from '@/modules/currency/currency.validation'
import { UserRole } from '@/modules/user/user.enum'
import asyncHandler from '@/helpers/asyncHandler'
import { SuccessCreatedResponse, SuccessResponse } from '@/core/apiResponse'
import routePermission from '@/helpers/routePermission'
import schemaValidator from '@/helpers/schemaValidator'
import { IController, IControllerRoute } from '@/core/utils'
import ServiceToken from '@/core/serviceToken'
import BaseController from '@/core/baseContoller'

@Service()
class CurrencyController extends BaseController implements IController {
  public path = '/currency'
  public routes: IControllerRoute[] = [
    [
      'post',
      `/master${this.path}/create`,
      routePermission(UserRole.ADMIN),
      schemaValidator(validate.create),
      (...params) => this.create(...params),
    ],
    [
      'get',
      `/master${this.path}`,
      routePermission(UserRole.ADMIN),
      (...params) => this.fetchAll(...params),
    ],
  ]

  constructor(
    @Inject(ServiceToken.CURRENCY_SERVICE)
    private currencyService: ICurrencyService
  ) {
    super()
    this.initialiseRoutes()
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
