import type { DepositMethodStatus } from './depositMethod.enum'

export interface IDepositMethod {
  __v: number
  _id: string
  currency: string
  updatedAt: string
  createdAt: string
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
