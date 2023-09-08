import type { IDepositMethod } from '../depositMethod/depositMethod.interface'
import type { DepositStatus } from './deposit.enum'

export interface IDeposit {
  __v: number
  _id: string
  updatedAt: string
  createdAt: string
  depositMethodObject: IDepositMethod
  user: {
    _id: string
    username: string
    isDeleted: boolean
  }
  status: DepositStatus
  amount: number
  fee: number
}
