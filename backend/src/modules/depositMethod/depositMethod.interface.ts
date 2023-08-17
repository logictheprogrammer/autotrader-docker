import { DepositMethodStatus } from '@/modules/depositMethod/depositMethod.enum'
import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import AppObjectId from '../app/app.objectId'
import AppDocument from '../app/app.document'

export interface IDepositMethodObject extends IAppObject {
  name: string
  symbol: string
  logo: string
  address: string
  network: string
  status: DepositMethodStatus
  fee: number
  minDeposit: number
  price: number
  autoUpdate: boolean
}

export interface IDepositMethod extends AppDocument {
  __v: number
  updatedAt: Date
  createdAt: Date
  name: string
  symbol: string
  logo: string
  address: string
  network: string
  status: DepositMethodStatus
  fee: number
  minDeposit: number
  price: number
  autoUpdate: boolean
}

export interface IDepositMethodService {
  create(
    currencyId: AppObjectId,
    address: string,
    network: string,
    fee: number,
    minDeposit: number
  ): THttpResponse<{ depositMethod: IDepositMethod }>

  update(
    depositMethodId: AppObjectId,
    currencyId: AppObjectId,
    address: string,
    network: string,
    fee: number,
    minDeposit: number
  ): THttpResponse<{ depositMethod: IDepositMethod }>

  get(depositMethodId: AppObjectId): Promise<IDepositMethodObject>

  fetchAll(all: boolean): THttpResponse<{ depositMethods: IDepositMethod[] }>

  delete(
    depositMethodId: AppObjectId
  ): THttpResponse<{ depositMethod: IDepositMethod }>

  updateStatus(
    depositMethodId: AppObjectId,
    status: DepositMethodStatus
  ): THttpResponse<{ depositMethod: IDepositMethod }>

  updateMode(
    depositMethodId: AppObjectId,
    autoUpdate: boolean
  ): THttpResponse<{ depositMethod: IDepositMethod }>

  updatePrice(
    depositMethodId: AppObjectId,
    price: number
  ): THttpResponse<{ depositMethod: IDepositMethod }>
}
