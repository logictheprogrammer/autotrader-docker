import { Document, Types } from 'mongoose'
import { TransferStatus } from '@/modules/transfer/transfer.enum'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { IAppObject } from '@/modules/app/app.interface'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { UserAccount } from '@/modules/user/user.enum'

export interface ITransferObject extends IAppObject {
  fromUser: IUser['_id']
  fromUserObject: IUser
  toUser: IUser['_id']
  toUserObject: IUser
  account: UserAccount
  status: TransferStatus
  amount: number
  fee: number
}

export interface ITransfer extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  fromUser: IUser['_id']
  fromUserObject: IUser
  toUser: IUser['_id']
  toUserObject: IUser
  account: UserAccount
  status: TransferStatus
  amount: number
  fee: number
}

export interface ITransferService {
  _createTransaction(
    fromUser: IUserObject,
    toUser: IUserObject,
    account: UserAccount,
    status: TransferStatus,
    fee: number,
    amount: number
  ): TTransaction<ITransferObject, ITransfer>

  _updateStatusTransaction(
    transferId: Types.ObjectId,
    status: TransferStatus
  ): TTransaction<ITransferObject, ITransfer>

  get(
    transferId: Types.ObjectId,
    isAdmin: boolean,
    userId?: Types.ObjectId
  ): Promise<ITransferObject>

  create(
    fromUserId: Types.ObjectId,
    toUserUsername: string,
    account: UserAccount,
    amount: number
  ): THttpResponse<{ transfer: ITransfer }>

  fetch(
    isAdmin: boolean,
    transferId: Types.ObjectId,
    userId?: Types.ObjectId
  ): THttpResponse<{ transfer: ITransfer }>

  fetchAll(
    allUsers: boolean,
    userId?: Types.ObjectId
  ): THttpResponse<{ transfers: ITransfer[] }>

  delete(transferId: Types.ObjectId): THttpResponse<{ transfer: ITransfer }>

  updateStatus(
    transferId: Types.ObjectId,
    status: TransferStatus
  ): THttpResponse<{ transfer: ITransfer }>
}
