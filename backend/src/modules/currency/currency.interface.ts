import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import AppDocument from '../app/app.document'
import AppObjectId from '../app/app.objectId'

export interface ICurrencyObject extends IAppObject {
  name: string
  symbol: string
  logo: string
}

export interface ICurrency extends AppDocument {
  __v: number
  updatedAt: Date
  createdAt: Date
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

  get(currencyId: AppObjectId): Promise<ICurrencyObject>

  fetchAll(): THttpResponse<{ currencies: ICurrency[] }>
}
