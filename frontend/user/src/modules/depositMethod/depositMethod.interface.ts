import { IBaseObject } from '@/util/interface'
import { ICurrency } from '../currency/currency.interface'
import type { DepositMethodStatus } from './depositMethod.enum'

export interface IDepositMethod extends IBaseObject {
  currency?: ICurrency
  address: string
  network: string
  status: DepositMethodStatus
  fee: number
  minDeposit: number
  price: number
  autoUpdate: boolean
}
