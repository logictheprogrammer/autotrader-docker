import { TransferStatus } from '@/modules/transfer/transfer.enum'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { UserAccount } from '@/modules/user/user.enum'
import { FilterQuery, ObjectId, Types } from 'mongoose'
import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'

export interface ITransferObject extends baseObjectInterface {
  fromUser: IUser['_id']
  toUser: IUser['_id']
  account: UserAccount
  status: TransferStatus
  amount: number
  fee: number
}

// @ts-ignore
export interface ITransfer extends baseModelInterface, ITransferObject {}

export interface ITransferService {
  create(
    fromUserId: ObjectId | Types.ObjectId,
    toUserUsername: string,
    account: UserAccount,
    amount: number
  ): Promise<ITransferObject>

  fetch(filter: FilterQuery<ITransfer>): Promise<ITransferObject>

  fetchAll(filter: FilterQuery<ITransfer>): Promise<ITransferObject[]>

  delete(filter: FilterQuery<ITransfer>): Promise<ITransferObject>

  count(filter: FilterQuery<ITransfer>): Promise<number>

  updateStatus(
    filter: FilterQuery<ITransfer>,
    status: TransferStatus
  ): Promise<ITransferObject>
}
