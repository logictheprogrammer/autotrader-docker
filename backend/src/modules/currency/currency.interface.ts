import { Document, Types } from 'mongoose'
import { IServiceObject } from '@/modules/service/service.interface'
import { THttpResponse } from '@/modules/http/http.type'

export interface ICurrencyObject extends IServiceObject {
  name: string
  symbol: string
  logo: string
}

export interface ICurrency extends Document {
  name: string
  symbol: string
  logo: string
}

export interface ICurrencyService {
  create(
    name: string,
    symbol: string,
    logo: string
  ): THttpResponse<{ currency: ICurrency }>

  get(currencyId: Types.ObjectId): Promise<ICurrencyObject>

  fetchAll(): THttpResponse<{ currencies: ICurrency[] }>
}
