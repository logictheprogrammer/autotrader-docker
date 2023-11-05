import { Inject, Service } from 'typedi'
import {
  ITransfer,
  ITransferObject,
  ITransferService,
} from '@/modules/transfer/transfer.interface'
import { TransferStatus } from '@/modules/transfer/transfer.enum'
import { IUserService } from '@/modules/user/user.interface'
import { ITransactionService } from '@/modules/transaction/transaction.interface'
import { TransactionCategory } from '@/modules/transaction/transaction.enum'
import { INotificationService } from '@/modules/notification/notification.interface'
import {
  NotificationCategory,
  NotificationForWho,
} from '@/modules/notification/notification.enum'

import { UserAccount, UserEnvironment } from '@/modules/user/user.enum'

import { ITransferSettingsService } from '@/modules/transferSettings/transferSettings.interface'
import { FilterQuery, ObjectId } from 'mongoose'
import ServiceToken from '@/core/serviceToken'
import { BadRequestError, NotFoundError } from '@/core/apiError'
import Helpers from '@/utils/helpers'
import TransferModel from '@/modules/transfer/transfer.model'

@Service()
class TransferService implements ITransferService {
  private transferModel = TransferModel

  public constructor(
    @Inject(ServiceToken.TRANSFER_SETTINGS_SERVICE)
    private transferSettingsService: ITransferSettingsService,
    @Inject(ServiceToken.USER_SERVICE) private userService: IUserService,
    @Inject(ServiceToken.TRANSACTION_SERVICE)
    private transactionService: ITransactionService,
    @Inject(ServiceToken.NOTIFICATION_SERVICE)
    private notificationService: INotificationService
  ) {}

  public async create(
    fromUserId: ObjectId,
    toUserUsername: string,
    account: UserAccount,
    amount: number
  ): Promise<ITransferObject> {
    // transfer settings options
    const transferSettings = await this.transferSettingsService.fetch({})

    const fee = transferSettings.fee
    const status = !transferSettings.approval
      ? TransferStatus.SUCCESSFUL
      : TransferStatus.PENDING

    let toUser = await this.userService.fetch({ username: toUserUsername })

    if (toUser._id.toString() === fromUserId.toString())
      throw new BadRequestError('You can not transfer to your own account')

    // fromUser instance
    const fromUser = await this.userService.fund(
      { _id: fromUserId },
      account,
      -(amount + fee)
    )

    if (status === TransferStatus.SUCCESSFUL) {
      // toUser instance

      toUser = await this.userService.fund(
        { _id: toUser._id },
        UserAccount.MAIN_BALANCE,
        amount
      )
    }

    // transfer instance

    const transfer = await this.transferModel.create({
      fromUser,
      toUser,
      account,
      amount,
      fee,
      status,
    })

    if (status === TransferStatus.SUCCESSFUL) {
      await this.transactionService.create(
        fromUser,
        status,
        TransactionCategory.TRANSFER_OUT,
        transfer,
        amount,
        UserEnvironment.LIVE
      )

      // fromUser notification instance
      await this.notificationService.create(
        `Your transfer of ${Helpers.toDollar(
          amount
        )} to ${toUserUsername} was successful.`,
        NotificationCategory.TRANSFER,
        transfer,
        NotificationForWho.USER,
        status,
        UserEnvironment.LIVE,
        fromUser
      )

      // toUser transaction instance
      await this.transactionService.create(
        toUser,
        status,
        TransactionCategory.TRANSFER_IN,
        transfer,
        amount,
        UserEnvironment.LIVE
      )

      // toUser notification instance
      await this.notificationService.create(
        `${fromUser.username} just sent you ${Helpers.toDollar(amount)}.`,
        NotificationCategory.TRANSFER,
        transfer,
        NotificationForWho.USER,
        status,
        UserEnvironment.LIVE,
        toUser
      )

      // admin notification instance
      await this.notificationService.create(
        `${
          fromUser.username
        } just made a successful transfer of ${Helpers.toDollar(amount)} to ${
          toUser.username
        }`,
        NotificationCategory.TRANSFER,
        transfer,
        NotificationForWho.ADMIN,
        status,
        UserEnvironment.LIVE
      )
    } else {
      // fromUser transaction instance
      await this.transactionService.create(
        fromUser,
        status,
        TransactionCategory.TRANSFER_OUT,
        transfer,
        amount,
        UserEnvironment.LIVE
      )

      // fromUser notification instance
      await this.notificationService.create(
        `Your transfer of ${Helpers.toDollar(
          amount
        )} to ${toUserUsername} is ongoing.`,
        NotificationCategory.TRANSFER,
        transfer,
        NotificationForWho.USER,
        status,
        UserEnvironment.LIVE,
        fromUser
      )

      // admin notification instance
      await this.notificationService.create(
        `${
          fromUser.username
        } just made a transfer request of ${Helpers.toDollar(amount)} to ${
          toUser.username
        } awaiting for your approver`,
        NotificationCategory.TRANSFER,
        transfer,
        NotificationForWho.ADMIN,
        status,
        UserEnvironment.LIVE
      )
    }

    await transfer.populate('toUser')
    await transfer.populate('fromUser')

    return transfer
  }

  public async delete(
    filter: FilterQuery<ITransfer>
  ): Promise<ITransferObject> {
    const transfer = await this.transferModel.findOne(filter)

    if (!transfer) throw new NotFoundError('Transfer not found')

    if (transfer.status === TransferStatus.PENDING)
      throw new BadRequestError('Transfer has not been settled yet')

    await transfer.deleteOne()
    return transfer
  }

  public async updateStatus(
    filter: FilterQuery<ITransfer>,
    status: TransferStatus
  ): Promise<ITransferObject> {
    const transfer = await this.transferModel
      .findOne(filter)
      .populate('toUser')
      .populate('fromUser')

    if (!transfer) throw new NotFoundError('Transfer not found')

    if (transfer.status !== TransferStatus.PENDING)
      throw new BadRequestError('Transfer as already been settled')

    transfer.status = status

    await transfer.save()

    // Add transaction instance
    await this.transactionService.updateStatus(transfer._id, status)

    let fromUser

    if (status === TransferStatus.REVERSED) {
      // Add fromUser Instance
      fromUser = await this.userService.fund(
        transfer.fromUser._id,
        transfer.account,
        transfer.amount + transfer.fee
      )
    } else {
      fromUser = await this.userService.fetch({ _id: transfer.fromUser._id })

      // Add toUser instance
      const toUser = await this.userService.fund(
        transfer.toUser._id,
        UserAccount.MAIN_BALANCE,
        transfer.amount
      )

      // Add toUser transaction instance
      await this.transactionService.create(
        toUser,
        status,
        TransactionCategory.TRANSFER_IN,
        transfer,
        transfer.amount,
        UserEnvironment.LIVE
      )

      // Add toUser notification instance
      await this.notificationService.create(
        `${fromUser.username} just sent you ${Helpers.toDollar(
          transfer.amount
        )}.`,
        NotificationCategory.TRANSFER,
        transfer,
        NotificationForWho.USER,
        status,
        UserEnvironment.LIVE,
        toUser
      )
    }

    await this.notificationService.create(
      `Your transfer of ${Helpers.toDollar(transfer.amount)} was ${status}`,
      NotificationCategory.TRANSFER,
      transfer,
      NotificationForWho.USER,
      status,
      UserEnvironment.LIVE,
      fromUser
    )

    return transfer
  }

  public async fetch(filter: FilterQuery<ITransfer>): Promise<ITransferObject> {
    const transfer = await this.transferModel
      .findOne(filter)
      .populate('toUser')
      .populate('fromUser')

    if (!transfer) throw new NotFoundError('Tranfer not found')

    return transfer
  }

  public async fetchAll(
    filter: FilterQuery<ITransfer>
  ): Promise<ITransferObject[]> {
    const transfers = await this.transferModel
      .find(filter)
      .sort({
        updatedAt: -1,
      })
      .populate('toUser')
      .populate('fromUser')

    return transfers
  }
}

export default TransferService
