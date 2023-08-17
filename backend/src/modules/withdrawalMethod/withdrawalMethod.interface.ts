import { Document, Types } from 'mongoose'
import { WithdrawalMethodStatus } from '@/modules/withdrawalMethod/withdrawalMethod.enum'
import { THttpResponse } from '@/modules/http/http.type'
import { IAppObject } from '@/modules/app/app.interface'

export interface IWithdrawalMethodObject extends IAppObject {
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
    currencyId: Types.ObjectId,
    network: string,
    fee: number,
    minWithdrawal: number
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }>

  update(
    withdrawalMethodId: Types.ObjectId,
    currencyId: Types.ObjectId,
    network: string,
    fee: number,
    minWithdrawal: number
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }>

  get(withdrawalMethodId: Types.ObjectId): Promise<IWithdrawalMethodObject>

  fetchAll(
    all: boolean
  ): THttpResponse<{ withdrawalMethods: IWithdrawalMethod[] }>

  delete(
    withdrawalMethodId: Types.ObjectId
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }>

  updateStatus(
    withdrawalMethodId: Types.ObjectId,
    status: WithdrawalMethodStatus
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }>
}
