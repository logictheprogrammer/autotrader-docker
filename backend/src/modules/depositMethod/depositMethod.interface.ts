import { DepositMethodStatus } from '@/modules/depositMethod/depositMethod.enum'
import { IAppObject } from '@/modules/app/app.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { Document, ObjectId, Types } from 'mongoose'

export interface IDepositMethodObject extends IAppObject {
  currency: ObjectId
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
  __v: number
  updatedAt: Date
  createdAt: Date
  currency: ObjectId
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
    currencyId: ObjectId,
    address: string,
    network: string,
    fee: number,
    minDeposit: number
  ): THttpResponse<{ depositMethod: IDepositMethod }>

  update(
    depositMethodId: ObjectId,
    currencyId: ObjectId,
    address: string,
    network: string,
    fee: number,
    minDeposit: number
  ): THttpResponse<{ depositMethod: IDepositMethod }>

  get(depositMethodId: ObjectId | Types.ObjectId): Promise<IDepositMethodObject>

  fetchAll(all: boolean): THttpResponse<{ depositMethods: IDepositMethod[] }>

  delete(
    depositMethodId: ObjectId
  ): THttpResponse<{ depositMethod: IDepositMethod }>

  updateStatus(
    depositMethodId: ObjectId,
    status: DepositMethodStatus
  ): THttpResponse<{ depositMethod: IDepositMethod }>

  updateMode(
    depositMethodId: ObjectId,
    autoUpdate: boolean
  ): THttpResponse<{ depositMethod: IDepositMethod }>

  updatePrice(
    depositMethodId: ObjectId,
    price: number
  ): THttpResponse<{ depositMethod: IDepositMethod }>
}
