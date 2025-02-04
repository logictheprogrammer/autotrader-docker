import { IBaseObject } from '@/util/interface'
import { ICurrency } from '../currency/currency.interface'
import type { WithdrawalMethodStatus } from './withdrawalMethod.enum'

export interface IWithdrawalMethod extends IBaseObject {
  currency?: ICurrency
  network: string
  status: WithdrawalMethodStatus
  fee: number
  minWithdrawal: number
}

export interface IAddNewWithdrawalMethod {
  currencyId: string
  network: string
  fee: number
  minDeposit: number
}

export interface IEditWithdrawalMethod {
  currencyId: string
  withdrawalMethodId: string
  network: string
  fee: number
  minDeposit: number
}

export interface IUpdateWithdrawalMethodStatus {
  withdrawalMethodId: string
  status: WithdrawalMethodStatus
}
