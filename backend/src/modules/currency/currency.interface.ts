import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { Document, ObjectId } from 'mongoose'

export interface ICurrencyObject extends IAppObject {
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

  get(currencyId: ObjectId): Promise<ICurrencyObject>

  fetchAll(): THttpResponse<{ currencies: ICurrency[] }>
}
