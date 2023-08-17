import { TransferStatus } from '@/modules/transfer/transfer.enum'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { IAppObject } from '@/modules/app/app.interface'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { UserAccount } from '@/modules/user/user.enum'
import AppDocument from '../app/app.document'
import AppObjectId from '../app/app.objectId'

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

export interface ITransfer extends AppDocument {
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
    transferId: AppObjectId,
    status: TransferStatus
  ): TTransaction<ITransferObject, ITransfer>

  get(
    transferId: AppObjectId,
    isAdmin: boolean,
    userId?: AppObjectId
  ): Promise<ITransferObject>

  create(
    fromUserId: AppObjectId,
    toUserUsername: string,
    account: UserAccount,
    amount: number
  ): THttpResponse<{ transfer: ITransfer }>

  fetch(
    isAdmin: boolean,
    transferId: AppObjectId,
    userId?: AppObjectId
  ): THttpResponse<{ transfer: ITransfer }>

  fetchAll(
    allUsers: boolean,
    userId?: AppObjectId
  ): THttpResponse<{ transfers: ITransfer[] }>

  delete(transferId: AppObjectId): THttpResponse<{ transfer: ITransfer }>

  updateStatus(
    transferId: AppObjectId,
    status: TransferStatus
  ): THttpResponse<{ transfer: ITransfer }>
}
