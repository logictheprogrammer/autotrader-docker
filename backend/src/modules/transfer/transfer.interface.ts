import { TransferStatus } from '@/modules/transfer/transfer.enum'
import { IUserObject } from '@/modules/user/user.interface'
import { UserAccount } from '@/modules/user/user.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'

export interface ITransferObject extends baseObjectInterface {
  fromUser: IUserObject
  toUser: IUserObject
  account: UserAccount
  status: TransferStatus
  amount: number
  fee: number
}

// @ts-ignore
export interface ITransfer extends baseModelInterface, ITransferObject {}

export interface ITransferService {
  create(
    fromUserId: ObjectId,
    toUserUsername: string,
    account: UserAccount,
    amount: number
  ): Promise<ITransferObject>

  fetch(filter: FilterQuery<ITransfer>): Promise<ITransferObject>

  fetchAll(filter: FilterQuery<ITransfer>): Promise<ITransferObject[]>

  delete(filter: FilterQuery<ITransfer>): Promise<ITransferObject>

  updateStatus(
    filter: FilterQuery<ITransfer>,
    status: TransferStatus
  ): Promise<ITransferObject>
}
