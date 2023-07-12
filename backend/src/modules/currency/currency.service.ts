import { Service } from 'typedi'
import {
  ICurrency,
  ICurrencyObject,
  ICurrencyService,
} from '@/modules/currency/currency.interface'
import currencyModel from '@/modules/currency/currency.model'
import { Types } from 'mongoose'
import ServiceQuery from '@/modules/service/service.query'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import ServiceException from '@/modules/service/service.exception'
import HttpException from '@/modules/http/http.exception'

@Service()
class CurrencyService implements ICurrencyService {
  private currencyModel = new ServiceQuery<ICurrency>(currencyModel)

  private find = async (
    currencyId: Types.ObjectId,
    fromAllAccounts: boolean = true,
    userId?: Types.ObjectId
  ): Promise<ICurrency> => {
    const currency = await this.currencyModel.findById(
      currencyId,
      fromAllAccounts,
      userId
    )

    if (!currency) throw new HttpException(404, 'Currency not found')

    return currency
  }

  public create = async (
    name: string,
    symbol: string,
    logo: string
  ): THttpResponse<{ currency: ICurrency }> => {
    try {
      await this.currencyModel.ifExist(
        {
          $or: [{ name }, { symbol }],
        },
        'Currency already exist'
      )

      const currency = await this.currencyModel.self.create({
        name,
        symbol,
        logo,
      })
      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Currency added successfully',
        data: { currency },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to save new currency, please try again'
      )
    }
  }

  public async get(currencyId: Types.ObjectId): Promise<ICurrencyObject> {
    try {
      const currency = await this.find(currencyId)

      return currency.toObject()
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to get currency, please try again'
      )
    }
  }

  public fetchAll = async (): THttpResponse<{ currencies: ICurrency[] }> => {
    try {
      const currencies = await this.currencyModel.find()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Currencies fetch successfully',
        data: { currencies },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to fetch currency, please try again'
      )
    }
  }
}

export default CurrencyService
