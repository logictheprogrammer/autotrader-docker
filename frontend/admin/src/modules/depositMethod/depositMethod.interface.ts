import type { DepositMethodStatus } from './depositMethod.enum'

export interface IDepositMethod {
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
  status: DepositMethodStatus
  fee: number
  minDeposit: number
  price: number
  autoUpdate: boolean
}

export interface IAddNewDepositMethod {
  currencyId: string
  address: string
  network: string
  fee: number
  minDeposit: number
}

export interface IEditDepositMethod {
  currencyId: string
  depositMethodId: string
  address: string
  network: string
  fee: number
  minDeposit: number
}

export interface IUpdateDepositMethodStatus {
  depositMethodId: string
  status: DepositMethodStatus
}
