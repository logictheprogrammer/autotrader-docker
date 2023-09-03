import type { IWithdrawalMethod } from '../withdrawalMethod/withdrawalMethod.interface'
import type { WithdrawalStatus } from './withdrawal.enum'
import type { UserAccount } from '../user/user.enum'

export interface IWithdrawal {
  __v: number
  _id: string
  updatedAt: Date
  createdAt: Date
  withdrawalMethodObject: IWithdrawalMethod
  user: string
  account: UserAccount
  address: string
  status: WithdrawalStatus
  amount: number
  fee: number
}

export interface ICreateWithdrawal {
  account: UserAccount
  address: string
  withdrawalMethodId: string
  amount: number
}
