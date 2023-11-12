import { Service } from 'typedi'
import {
  ICurrency,
  ICurrencyObject,
  ICurrencyService,
} from '@/modules/currency/currency.interface'
import { FilterQuery } from 'mongoose'
import { NotFoundError, RequestConflictError } from '@/core/apiError'
import CurrencyModel from '@/modules/currency/currency.model'

@Service()
class CurrencyService implements ICurrencyService {
  private currencyModel = CurrencyModel

  public async create(
    name: string,
    symbol: string,
    logo: string
  ): Promise<ICurrencyObject> {
    const currencyExist = await this.currencyModel.findOne({
      $or: [{ name }, { symbol }],
    })

    if (currencyExist) throw new RequestConflictError('Currency already exist')

    const currency = await this.currencyModel.create({
      name,
      symbol,
      logo,
    })

    return currency
  }

  public async fetch(filter: FilterQuery<ICurrency>): Promise<ICurrencyObject> {
    const currency = await this.currencyModel.findOne(filter)

    if (!currency) throw new NotFoundError('Currency not found')

    return currency
  }

  public async fetchAll(
    filter: FilterQuery<ICurrency>
  ): Promise<ICurrencyObject[]> {
    return await this.currencyModel.find(filter)
  }

  public async count(filter: FilterQuery<ICurrency>): Promise<number> {
    return await this.currencyModel.count(filter)
  }
}

export default CurrencyService
