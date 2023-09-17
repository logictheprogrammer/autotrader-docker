import { WithdrawalMethodStatus } from '@/modules/withdrawalMethod/withdrawalMethod.enum'
import { THttpResponse } from '@/modules/http/http.type'
import { IAppObject } from '@/modules/app/app.interface'
import { ObjectId, Document, Types } from 'mongoose'

export interface IWithdrawalMethodObject extends IAppObject {
  currency: ObjectId
  name: string
  symbol: string
  logo: string
  network: string
  status: WithdrawalMethodStatus
  fee: number
  minWithdrawal: number
}

export interface IWithdrawalMethod extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  currency: ObjectId
  name: string
  symbol: string
  logo: string
  network: string
  status: WithdrawalMethodStatus
  fee: number
  minWithdrawal: number
}

export interface IWithdrawalMethodService {
  create(
    currencyId: ObjectId,
    network: string,
    fee: number,
    minWithdrawal: number
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }>

  update(
    withdrawalMethodId: ObjectId,
    currencyId: ObjectId,
    network: string,
    fee: number,
    minWithdrawal: number
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }>

  get(
    withdrawalMethodId: ObjectId | Types.ObjectId
  ): Promise<IWithdrawalMethodObject>

  fetchAll(
    all: boolean
  ): THttpResponse<{ withdrawalMethods: IWithdrawalMethod[] }>

  delete(
    withdrawalMethodId: ObjectId
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }>

  updateStatus(
    withdrawalMethodId: ObjectId,
    status: WithdrawalMethodStatus
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }>
}
