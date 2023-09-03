import type { IDepositMethod } from '../depositMethod/depositMethod.interface'
import type { DepositStatus } from './deposit.enum'

export interface IDeposit {
  __v: number
  _id: string
  updatedAt: Date
  createdAt: Date
  depositMethodObject: IDepositMethod
  user: string
  status: DepositStatus
  amount: number
  fee: number
}

export interface ICreateDeposit {
  depositMethodId: string
  amount: number
}
