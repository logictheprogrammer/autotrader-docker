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
import { ObjectId, Types } from 'mongoose'
import { ErrorCode } from '@/utils/enums/errorCodes.enum'

@Service()
class CurrencyService implements ICurrencyService {
  private currencyModel = currencyModel

  private find = async (
    currencyId: ObjectId | Types.ObjectId,
    fromAllAccounts: boolean = true,
    userId?: ObjectId
  ): Promise<ICurrency> => {
    let currency

    if (fromAllAccounts) {
      currency = await this.currencyModel.findById(currencyId)
    } else {
      currency = await this.currencyModel.findOne({
        _id: currencyId,
        user: userId,
      })
    }

    if (!currency) throw new HttpException(404, 'Currency not found')

    return currency
  }

  public create = async (
    name: string,
    symbol: string,
    logo: string
  ): THttpResponse<{ currency: ICurrency }> => {
    try {
      const currencyExist = await this.currencyModel.findOne({
        $or: [{ name }, { symbol }],
      })

      if (currencyExist)
        throw new HttpException(
          ErrorCode.REQUEST_CONFLICT,
          'Currency already exist'
        )

      const currency = await this.currencyModel.create({
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
      throw new AppException(
        err,
        'Unable to save new currency, please try again'
      )
    }
  }

  public async get(
    currencyId: ObjectId | Types.ObjectId
  ): Promise<ICurrencyObject> {
    try {
      const currency = await this.find(currencyId)

      return currency.toObject({ getters: true })
    } catch (err: any) {
      throw new AppException(err, 'Unable to get currency, please try again')
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
      throw new AppException(err, 'Unable to fetch currency, please try again')
    }
  }
}

export default CurrencyService
