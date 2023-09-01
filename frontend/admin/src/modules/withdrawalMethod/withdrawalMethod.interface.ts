import type { WithdrawalMethodStatus } from './withdrawalMethod.enum'

export interface IWithdrawalMethod {
  __v: number
  _id: string
  currency: string
  updatedAt: Date
  createdAt: Date
  name: string
  symbol: string
  logo: string
  address: string
  network: string
  status: WithdrawalMethodStatus
  fee: number
  minDeposit: number
  price: number
  autoUpdate: boolean
}

export interface IAddNewWithdrawalMethod {
  currencyId: string
  address: string
  network: string
  fee: number
  minDeposit: number
}

export interface IEditWithdrawalMethod {
  currencyId: string
  withdrawalMethodId: string
  address: string
  network: string
  fee: number
  minDeposit: number
}

export interface IUpdateWithdrawalMethodStatus {
  withdrawalMethodId: string
  status: WithdrawalMethodStatus
}
