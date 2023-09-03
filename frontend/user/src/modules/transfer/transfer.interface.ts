import type { TransferStatus } from './transfer.enum'
import type { UserAccount } from '../user/user.enum'

export interface ITransfer {
  __v: number
  _id: string
  updatedAt: Date
  createdAt: Date
  fromUser: {
    _id: string
    username: string
    isDeleted: boolean
  }
  toUser: {
    _id: string
    username: string
    isDeleted: boolean
  }
  account: UserAccount
  status: TransferStatus
  amount: number
  fee: number
}

export interface ICreateTransfer {
  toUserUsername: string
  account: UserAccount
  amount: number
}
