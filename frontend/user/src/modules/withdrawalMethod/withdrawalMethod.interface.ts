import type { WithdrawalMethodStatus } from './withdrawalMethod.enum'

export interface IWithdrawalMethod {
  __v: number
  _id: string
  currency: string
  updatedAt: string
  createdAt: string
  name: string
  symbol: string
  logo: string
  network: string
  status: WithdrawalMethodStatus
  fee: number
  minWithdrawal: number
  autoUpdate: boolean
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
