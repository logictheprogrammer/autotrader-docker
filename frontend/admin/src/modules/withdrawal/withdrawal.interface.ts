import type { IWithdrawalMethod } from '../withdrawalMethod/withdrawalMethod.interface'
import type { WithdrawalStatus } from './withdrawal.enum'
import type { UserAccount } from '../user/user.enum'

export interface IWithdrawal {
  __v: number
  _id: string
  updatedAt: Date
  createdAt: Date
  withdrawalMethodObject: IWithdrawalMethod
  user: {
    _id: string
    username: string
    isDeleted: boolean
  }
  account: UserAccount
  address: string
  status: WithdrawalStatus
  amount: number
  fee: number
}
