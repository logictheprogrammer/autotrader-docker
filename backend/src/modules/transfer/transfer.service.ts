import { Inject, Service } from 'typedi'
import {
  ITransfer,
  ITransferObject,
  ITransferService,
} from '@/modules/transfer/transfer.interface'
import transferModel from '@/modules/transfer/transfer.model'
import ServiceToken from '@/utils/enums/serviceToken'
import { TransferStatus } from '@/modules/transfer/transfer.enum'
import { IUser, IUserObject, IUserService } from '@/modules/user/user.interface'
import {
  ITransaction,
  ITransactionService,
} from '@/modules/transaction/transaction.interface'
import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import {
  INotification,
  INotificationService,
} from '@/modules/notification/notification.interface'
import formatNumber from '@/utils/formats/formatNumber'
import {
  NotificationCategory,
  NotificationForWho,
} from '@/modules/notification/notification.enum'
import {
  ITransactionInstance,
  ITransactionManagerService,
} from '@/modules/transactionManager/transactionManager.interface'
import { UserAccount, UserEnvironment } from '@/modules/user/user.enum'
import ServiceQuery from '@/modules/service/service.query'
import { THttpResponse } from '@/modules/http/http.type'
import HttpException from '@/modules/http/http.exception'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import ServiceException from '@/modules/service/service.exception'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import { ITransferSettingsService } from '@/modules/transferSettings/transferSettings.interface'
import { Types } from 'mongoose'

@Service()
class TransferService implements ITransferService {
  private transferModel = new ServiceQuery<ITransfer>(transferModel)

  public constructor(
    @Inject(ServiceToken.TRANSFER_SETTINGS_SERVICE)
    private transferSettingsService: ITransferSettingsService,
    @Inject(ServiceToken.USER_SERVICE) private userService: IUserService,
    @Inject(ServiceToken.TRANSACTION_SERVICE)
    private transactionService: ITransactionService,
    @Inject(ServiceToken.NOTIFICATION_SERVICE)
    private notificationService: INotificationService,
    @Inject(ServiceToken.TRANSACTION_MANAGER_SERVICE)
    private transactionManagerService: ITransactionManagerService<any>
  ) {}

  private find = async (
    transferId: Types.ObjectId,
    fromAllAccounts: boolean = true,
    userId?: Types.ObjectId
  ): Promise<ITransfer> => {
    const transfer = await this.transferModel.findOne(
      { _id: transferId },
      fromAllAccounts,
      { $or: [{ fromUser: userId }, { toUser: userId }] }
    )

    if (!transfer)
      throw new HttpException(404, 'Transfer transaction not found')

    return transfer
  }

  public async _updateStatusTransaction(
    transferId: Types.ObjectId,
    status: TransferStatus
  ): TTransaction<ITransferObject, ITransfer> {
    const transfer = await this.find(transferId)

    const oldStatus = transfer.status

    if (oldStatus !== TransferStatus.PENDING)
      throw new HttpException(400, 'Transfer as already been settled')

    transfer.status = status

    return {
      object: transfer.toObject(),
      instance: {
        model: transfer,
        onFailed: `Set the status of the transfer with an id of (${transfer._id}) to (${oldStatus})`,
        async callback() {
          transfer.status = oldStatus
          await transfer.save()
        },
      },
    }
  }

  public async _createTransaction(
    fromUser: IUserObject,
    toUser: IUserObject,
    account: UserAccount,
    status: TransferStatus,
    fee: number,
    amount: number
  ): TTransaction<ITransferObject, ITransfer> {
    const transfer = new this.transferModel.self({
      fromUser: fromUser._id,
      fromUserObject: fromUser,
      toUser: toUser._id,
      toUserObject: toUser,
      account,
      amount,
      fee,
      status,
    })

    return {
      object: transfer.toObject(),
      instance: {
        model: transfer,
        onFailed: `Delete the transfer with an id of (${transfer._id})`,
        async callback() {
          await transfer.deleteOne()
        },
      },
    }
  }

  public create = async (
    fromUserId: Types.ObjectId,
    toUserUsername: string,
    account: UserAccount,
    amount: number
  ): THttpResponse<{ transfer: ITransfer }> => {
    try {
      // transaction instances declearation
      const transactionInstances: ITransactionInstance<
        ITransfer | ITransaction | INotification | IUser
      >[] = []

      // transfer settings options
      const transferSettings = await this.transferSettingsService.get()

      const fee = transferSettings.fee
      const status = !transferSettings.approval
        ? TransferStatus.SUCCESSFUL
        : TransferStatus.PENDING

      // fromUser instance
      const fromUserTransaction = await this.userService.fund(
        fromUserId,
        account,
        -(amount + fee)
      )

      transactionInstances.push(fromUserTransaction.instance)

      const fromUser = fromUserTransaction.object

      let toUser

      if (status === TransferStatus.SUCCESSFUL) {
        // toUser instance
        const toUserTransaction = await this.userService.fund(
          toUserUsername,
          UserAccount.MAIN_BALANCE,
          amount
        )
        transactionInstances.push(toUserTransaction.instance)

        toUser = toUserTransaction.object
      } else {
        toUser = await this.userService.get(toUserUsername)
      }

      if (toUser._id === fromUser._id)
        throw new HttpException(400, 'You can not transfer to your own account')

      // transfer instance
      const { object: transfer, instance: transferInstance } =
        await this._createTransaction(
          fromUser,
          toUser,
          account,
          status,
          fee,
          amount
        )
      transactionInstances.push(transferInstance)

      if (status === TransferStatus.SUCCESSFUL) {
        // fromUser Transaction Instance
        const fromUserTransactionTransaction =
          await this.transactionService.create(
            fromUser,
            status,
            TransactionCategory.TRANSFER,
            transfer,
            amount,
            UserEnvironment.LIVE
          )
        transactionInstances.push(fromUserTransactionTransaction)

        // fromUser notification instance
        const fromUserNotification = await this.notificationService.create(
          `Your transfer of ${formatNumber.toDollar(
            amount
          )} to ${toUserUsername} was successful.`,
          NotificationCategory.TRANSFER,
          transfer,
          NotificationForWho.USER,
          status,
          UserEnvironment.LIVE,
          fromUser
        )
        transactionInstances.push(fromUserNotification)

        // toUser transaction instance
        const toUserTransaction = await this.transactionService.create(
          toUser,
          status,
          TransactionCategory.TRANSFER,
          transfer,
          amount,
          UserEnvironment.LIVE
        )
        transactionInstances.push(toUserTransaction)

        // toUser notification instance
        const toUserNotification = await this.notificationService.create(
          `${fromUser.username} just sent you ${formatNumber.toDollar(
            amount
          )}.`,
          NotificationCategory.TRANSFER,
          transfer,
          NotificationForWho.USER,
          status,
          UserEnvironment.LIVE,
          toUser
        )
        transactionInstances.push(toUserNotification)

        // admin notification instance
        const adminNotification = await this.notificationService.create(
          `${
            fromUser.username
          } just made a successful transfer of ${formatNumber.toDollar(
            amount
          )} to ${toUser.username}`,
          NotificationCategory.TRANSFER,
          transfer,
          NotificationForWho.ADMIN,
          status,
          UserEnvironment.LIVE
        )
        transactionInstances.push(adminNotification)
      } else {
        // fromUser transaction instance
        const fromUserTransaction = await this.transactionService.create(
          fromUser,
          status,
          TransactionCategory.TRANSFER,
          transfer,
          amount,
          UserEnvironment.LIVE
        )
        transactionInstances.push(fromUserTransaction)

        // fromUser notification instance
        const fromUserNotification = await this.notificationService.create(
          `Your transfer of ${formatNumber.toDollar(
            amount
          )} to ${toUserUsername} is ongoing.`,
          NotificationCategory.TRANSFER,
          transfer,
          NotificationForWho.USER,
          status,
          UserEnvironment.LIVE,
          fromUser
        )
        transactionInstances.push(fromUserNotification)

        // admin notification instance
        const adminNotification = await this.notificationService.create(
          `${
            fromUser.username
          } just made a transfer request of ${formatNumber.toDollar(
            amount
          )} to ${toUser.username} awaiting for your approver`,
          NotificationCategory.TRANSFER,
          transfer,
          NotificationForWho.ADMIN,
          status,
          UserEnvironment.LIVE
        )
        transactionInstances.push(adminNotification)
      }

      // execute all transaction instances
      await this.transactionManagerService.execute(transactionInstances)

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Transfer has been registered successfully',
        data: { transfer: transferInstance.model },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to register this transfer, please try again'
      )
    }
  }

  public async get(
    transferId: Types.ObjectId,
    fromAllAccounts: boolean = true,
    userId?: Types.ObjectId
  ): Promise<ITransferObject> {
    return (await this.find(transferId, fromAllAccounts, userId)).toObject()
  }

  public delete = async (
    transferId: Types.ObjectId
  ): THttpResponse<{ transfer: ITransfer }> => {
    try {
      const transfer = await this.find(transferId)

      if (transfer.status === TransferStatus.PENDING)
        throw new HttpException(400, 'Transfer has not been settled yet')

      await transfer.deleteOne()
      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Transfer deleted successfully',
        data: { transfer },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to delete this transfer, please try again'
      )
    }
  }

  public updateStatus = async (
    transferId: Types.ObjectId,
    status: TransferStatus
  ): THttpResponse<{ transfer: ITransfer }> => {
    try {
      // Declear executable Instances
      const transactionInstances: ITransactionInstance<any>[] = []

      // Add transfer instance
      const { instance: transferInstance, object: transfer } =
        await this._updateStatusTransaction(transferId, status)

      transactionInstances.push(transferInstance)

      // Add transaction instance
      const transactionInstance = await this.transactionService.updateStatus(
        transfer._id,
        status
      )

      transactionInstances.push(transactionInstance)

      let fromUser

      if (status === TransferStatus.REVERSED) {
        // Add fromUser Instance
        const fromUserTransaction = await this.userService.fund(
          transfer.fromUser,
          transfer.account,
          transfer.amount + transfer.fee
        )

        transactionInstances.push(fromUserTransaction.instance)

        fromUser = fromUserTransaction.object
      } else {
        fromUser = await this.userService.get(transfer.fromUser)

        // Add toUser instance
        const toUserTransaction = await this.userService.fund(
          transfer.toUser,
          UserAccount.MAIN_BALANCE,
          transfer.amount
        )
        transactionInstances.push(toUserTransaction.instance)

        const toUser = toUserTransaction.object

        // Add toUser transaction instance
        const toUserTransactionTransaction =
          await this.transactionService.create(
            toUser,
            status,
            TransactionCategory.TRANSFER,
            transfer,
            transfer.amount,
            UserEnvironment.LIVE
          )

        transactionInstances.push(toUserTransactionTransaction)

        // Add toUser notification instance
        const toUserNotification = await this.notificationService.create(
          `${fromUser.username} just sent you ${formatNumber.toDollar(
            transfer.amount
          )}.`,
          NotificationCategory.TRANSFER,
          transfer,
          NotificationForWho.USER,
          status,
          UserEnvironment.LIVE,
          toUser
        )
        transactionInstances.push(toUserNotification)
      }

      const sendingNotification = await this.notificationService.create(
        `Your transfer of ${formatNumber.toDollar(
          transfer.amount
        )} was ${status}`,
        NotificationCategory.TRANSFER,
        transfer,
        NotificationForWho.USER,
        status,
        UserEnvironment.LIVE,
        fromUser
      )
      transactionInstances.push(sendingNotification)

      await this.transactionManagerService.execute(transactionInstances)

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Status updated successfully',
        data: { transfer: transferInstance.model },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to update this transfer status, please try again'
      )
    }
  }

  public fetch = async (
    fromAllAccounts: boolean,
    transferId: Types.ObjectId,
    userId?: Types.ObjectId
  ): THttpResponse<{ transfer: ITransfer }> => {
    try {
      const transfer = await this.find(transferId, fromAllAccounts, userId)

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Transfer history fetched successfully',
        data: { transfer },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to fetch transfer history, please try again'
      )
    }
  }

  public fetchAll = async (
    allUsers: boolean,
    userId: Types.ObjectId
  ): THttpResponse<{ transfers: ITransfer[] }> => {
    try {
      const transfers = await this.transferModel
        .find({}, allUsers, {
          $or: [{ fromUser: userId }, { toUser: userId }],
        })
        .select('-fromUserObject -toUserObject')

      await this.transferModel.populate(
        transfers,
        'fromUser',
        'fromUserObject',
        'username isDeleted'
      )

      await this.transferModel.populate(
        transfers,
        'toUser',
        'toUserObject',
        'username isDeleted'
      )

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Transfer history fetched successfully',
        data: { transfers },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to fetch transfer history, please try again'
      )
    }
  }
}

export default TransferService
