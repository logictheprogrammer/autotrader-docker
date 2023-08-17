import { Service } from 'typedi'
import {
  ICurrency,
  ICurrencyObject,
  ICurrencyService,
} from '@/modules/currency/currency.interface'
import currencyModel from '@/modules/currency/currency.model'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import AppException from '@/modules/app/app.exception'
import HttpException from '@/modules/http/http.exception'
import AppRepository from '../app/app.repository'
import AppObjectId from '../app/app.objectId'

@Service()
class CurrencyService implements ICurrencyService {
  private currencyRepository = new AppRepository<ICurrency>(currencyModel)

  private find = async (
    currencyId: AppObjectId,
    fromAllAccounts: boolean = true,
    userId?: AppObjectId
  ): Promise<ICurrency> => {
    const currency = await this.currencyRepository
      .findById(currencyId, fromAllAccounts, userId)
      .collect()

    if (!currency) throw new HttpException(404, 'Currency not found')

    return currency
  }

  public create = async (
    name: string,
    symbol: string,
    logo: string
  ): THttpResponse<{ currency: ICurrency }> => {
    try {
      await this.currencyRepository.ifExist(
        {
          $or: [{ name }, { symbol }],
        },
        'Currency already exist'
      )

      const currency = await this.currencyRepository
        .create({
          name,
          symbol,
          logo,
        })
        .save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Currency added successfully',
        data: { currency },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Unable to save new currency, please try again'
      )
    }
  }

  public async get(currencyId: AppObjectId): Promise<ICurrencyObject> {
    try {
      const currency = await this.find(currencyId)

      return this.currencyRepository.toObject(currency)
    } catch (err: any) {
      throw new AppException(err, 'Unable to get currency, please try again')
    }
  }

  public fetchAll = async (): THttpResponse<{ currencies: ICurrency[] }> => {
    try {
      const currencies = await this.currencyRepository.find().collectAll()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Currencies fetch successfully',
        data: { currencies },
      }
    } catch (err: any) {
      throw new AppException(err, 'Unable to fetch currency, please try again')
    }
  }
}

export default CurrencyService
