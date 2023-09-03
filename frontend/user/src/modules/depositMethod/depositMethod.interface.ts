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
