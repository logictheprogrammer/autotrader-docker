import { Service } from 'typedi'
import {
  ICurrency,
  ICurrencyObject,
  ICurrencyService,
} from '@/modules/currency/currency.interface'
import currencyModel from '@/modules/currency/currency.model'
import { FilterQuery, ObjectId, Types } from 'mongoose'
import {
  NotFoundError,
  RequestConflictError,
  ServiceError,
} from '@/core/apiError'

@Service()
class CurrencyService implements ICurrencyService {
  private currencyModel = currencyModel

  public async create(
    name: string,
    symbol: string,
    logo: string
  ): Promise<ICurrencyObject> {
    try {
      const currencyExist = await this.currencyModel.findOne({
        $or: [{ name }, { symbol }],
      })

      if (currencyExist)
        throw new RequestConflictError('Currency already exist')

      const currency = await this.currencyModel.create({
        name,
        symbol,
        logo,
      })

      return currency
    } catch (err: any) {
      throw new ServiceError(err, 'Unable to create currency, please try again')
    }
  }

  public async fetch(filter: FilterQuery<ICurrency>): Promise<ICurrencyObject> {
    try {
      const currency = await this.currencyModel.findOne(filter)

      if (!currency) throw new NotFoundError('Currency not found')

      return currency
    } catch (err: any) {
      throw new ServiceError(err, 'Unable to fetch currency, please try again')
    }
  }

  public async fetchAll(
    filter: FilterQuery<ICurrency>
  ): Promise<ICurrencyObject[]> {
    try {
      return await this.currencyModel.find(filter)
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Unable to fetch currencies, please try again'
      )
    }
  }
}

export default CurrencyService
