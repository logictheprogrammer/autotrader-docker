import type { TransferStatus } from './transfer.enum'
import type { UserAccount } from '../user/user.enum'
import { IUser } from '../user/user.interface'
import { IBaseObject } from '@/util/interface'

export interface ITransfer extends IBaseObject {
  fromUser?: IUser
  toUser?: IUser
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
