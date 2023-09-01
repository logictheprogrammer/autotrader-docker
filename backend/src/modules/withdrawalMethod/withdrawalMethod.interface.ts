import { WithdrawalMethodStatus } from '@/modules/withdrawalMethod/withdrawalMethod.enum'
import { THttpResponse } from '@/modules/http/http.type'
import { IAppObject } from '@/modules/app/app.interface'
import AppDocument from '../app/app.document'
import AppObjectId from '../app/app.objectId'

export interface IWithdrawalMethodObject extends IAppObject {
  currency: AppObjectId
  name: string
  symbol: string
  logo: string
  network: string
  status: WithdrawalMethodStatus
  fee: number
  minWithdrawal: number
}

export interface IWithdrawalMethod extends AppDocument {
  __v: number
  updatedAt: Date
  createdAt: Date
  currency: AppObjectId
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
    currencyId: AppObjectId,
    network: string,
    fee: number,
    minWithdrawal: number
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }>

  update(
    withdrawalMethodId: AppObjectId,
    currencyId: AppObjectId,
    network: string,
    fee: number,
    minWithdrawal: number
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }>

  get(withdrawalMethodId: AppObjectId): Promise<IWithdrawalMethodObject>

  fetchAll(
    all: boolean
  ): THttpResponse<{ withdrawalMethods: IWithdrawalMethod[] }>

  delete(
    withdrawalMethodId: AppObjectId
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }>

  updateStatus(
    withdrawalMethodId: AppObjectId,
    status: WithdrawalMethodStatus
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }>
}
