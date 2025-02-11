import { ICurrency } from '../currency/currency.interface'
import type { IDepositMethod } from '../depositMethod/depositMethod.interface'
import { IUser } from '../user/user.interface'
import type { DepositStatus } from './deposit.enum'

export interface IDeposit {
  __v: number
  _id: string
  updatedAt: string
  createdAt: string
  depositMethod: IDepositMethod
  currency: ICurrency
  user: IUser
  status: DepositStatus
  amount: number
  fee: number
}
