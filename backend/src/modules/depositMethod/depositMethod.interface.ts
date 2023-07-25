import { Document, Types } from 'mongoose'
import { DepositMethodStatus } from '@/modules/depositMethod/depositMethod.enum'
import { IServiceObject } from '@/modules/service/service.interface'
import { THttpResponse } from '@/modules/http/http.type'

export interface IDepositMethodObject extends IServiceObject {
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

export interface IDepositMethod extends Document {
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
    currencyId: Types.ObjectId,
    address: string,
    network: string,
    fee: number,
    minDeposit: number
  ): THttpResponse<{ depositMethod: IDepositMethod }>

  update(
    depositMethodId: Types.ObjectId,
    currencyId: Types.ObjectId,
    address: string,
    network: string,
    fee: number,
    minDeposit: number
  ): THttpResponse<{ depositMethod: IDepositMethod }>

  get(depositMethodId: Types.ObjectId): Promise<IDepositMethodObject>

  fetchAll(all: boolean): THttpResponse<{ depositMethods: IDepositMethod[] }>

  delete(
    depositMethodId: Types.ObjectId
  ): THttpResponse<{ depositMethod: IDepositMethod }>

  updateStatus(
    depositMethodId: Types.ObjectId,
    status: DepositMethodStatus
  ): THttpResponse<{ depositMethod: IDepositMethod }>

  updateMode(
    depositMethodId: Types.ObjectId,
    autoUpdate: boolean
  ): THttpResponse<{ depositMethod: IDepositMethod }>

  updatePrice(
    depositMethodId: Types.ObjectId,
    price: number
  ): THttpResponse<{ depositMethod: IDepositMethod }>
}
