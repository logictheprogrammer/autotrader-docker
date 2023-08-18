import { Inject, Service } from 'typedi'
import {
  IWithdrawal,
  IWithdrawalObject,
  IWithdrawalService,
} from '@/modules/withdrawal/withdrawal.interface'
import withdrawalModel from '@/modules/withdrawal/withdrawal.model'
import ServiceToken from '@/utils/enums/serviceToken'
import { WithdrawalStatus } from '@/modules/withdrawal/withdrawal.enum'
import {
  IWithdrawalMethodObject,
  IWithdrawalMethodService,
} from '@/modules/withdrawalMethod/withdrawalMethod.interface'
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
import { THttpResponse } from '@/modules/http/http.type'
import HttpException from '@/modules/http/http.exception'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import AppException from '@/modules/app/app.exception'
import { TTransaction } from '@/modules/transactionManager/transactionManager.type'
import AppRepository from '../app/app.repository'
import AppObjectId from '../app/app.objectId'
import userModel from '../user/user.model'

@Service()
class WithdrawalService implements IWithdrawalService {
  private withdrawalRepository = new AppRepository<IWithdrawal>(withdrawalModel)
  private userRepository = new AppRepository<IUser>(userModel)

  public constructor(
    @Inject(ServiceToken.WITHDRAWAL_METHOD_SERVICE)
    private withdrawalMethodService: IWithdrawalMethodService,
    @Inject(ServiceToken.USER_SERVICE) private userService: IUserService,
    @Inject(ServiceToken.TRANSACTION_SERVICE)
    private transactionService: ITransactionService,
    @Inject(ServiceToken.NOTIFICATION_SERVICE)
    private notificationService: INotificationService,
    @Inject(ServiceToken.TRANSACTION_MANAGER_SERVICE)
    private transactionManagerService: ITransactionManagerService<any>
  ) {}

  private find = async (
    withdrawalId: AppObjectId,
    fromAllAccounts: boolean = true,
    userId?: AppObjectId
  ): Promise<IWithdrawal> => {
    const withdrawal = await this.withdrawalRepository
      .findById(withdrawalId, fromAllAccounts, userId)
      .collect()

    if (!withdrawal)
      throw new HttpException(404, 'Withdrawal transaction not found')

    return withdrawal
  }

  public async _updateStatusTransaction(
    withdrawalId: AppObjectId,
    status: WithdrawalStatus
  ): TTransaction<IWithdrawalObject, IWithdrawal> {
    const withdrawal = await this.find(withdrawalId)

    if (!Object.values(WithdrawalStatus).includes(status))
      throw new HttpException(400, 'Invalid withdrawal status')

    const oldStatus = withdrawal.status

    if (oldStatus !== WithdrawalStatus.PENDING)
      throw new HttpException(400, 'Withdrawal as already been settled')

    withdrawal.status = status

    const newWithdrawal = this.withdrawalRepository.toClass(withdrawal)

    const unsavedWithdrawal = newWithdrawal.collectUnsaved()

    return {
      object: unsavedWithdrawal,
      instance: {
        model: newWithdrawal,
        onFailed: `Set the status of the withdrawal with an id of (${unsavedWithdrawal._id}) to (${oldStatus})`,
        callback: async () => {
          unsavedWithdrawal.status = oldStatus
          await this.withdrawalRepository.save(unsavedWithdrawal)
        },
      },
    }
  }

  public async _createTransaction(
    withdrawalMethod: IWithdrawalMethodObject,
    user: IUserObject,
    account: UserAccount,
    address: string,
    amount: number
  ): TTransaction<IWithdrawalObject, IWithdrawal> {
    const withdrawal = this.withdrawalRepository.create({
      withdrawalMethod: withdrawalMethod._id,
      withdrawalMethodObject: withdrawalMethod,
      user: user._id,
      userObject: user,
      account,
      address,
      amount,
      fee: withdrawalMethod.fee,
      status: WithdrawalStatus.PENDING,
    })

    const unsavedWithdrawal = withdrawal.collectUnsaved()

    return {
      object: unsavedWithdrawal,
      instance: {
        model: withdrawal,
        onFailed: `Delete the withdrawal with an id of (${unsavedWithdrawal._id})`,
        async callback() {
          await withdrawal.deleteOne()
        },
      },
    }
  }

  public create = async (
    withdrawalMethodId: AppObjectId,
    userId: AppObjectId,
    account: UserAccount,
    address: string,
    amount: number
  ): THttpResponse<{ withdrawal: IWithdrawal }> => {
    try {
      const withdrawalMethod = await this.withdrawalMethodService.get(
        withdrawalMethodId
      )

      if (!withdrawalMethod)
        throw new HttpException(404, 'Withdrawal method not found')

      if (withdrawalMethod.minWithdrawal > amount)
        throw new HttpException(
          400,
          'Amount is lower than the min withdrawal of the selected withdrawal method'
        )

      const transactionInstances: ITransactionInstance<any>[] = []

      const userTransaction = await this.userService.fund(
        userId,
        account,
        -(amount + withdrawalMethod.fee)
      )

      transactionInstances.push(userTransaction.instance)

      const user = userTransaction.object

      const { object: withdrawal, instance: withdrawalInstance } =
        await this._createTransaction(
          withdrawalMethod,
          user,
          account,
          address,
          amount
        )
      transactionInstances.push(withdrawalInstance)

      const transaction = await this.transactionService.create(
        user,
        withdrawal.status,
        TransactionCategory.WITHDRAWAL,
        withdrawal,
        amount,
        UserEnvironment.LIVE
      )
      transactionInstances.push(transaction)

      const adminNotification = await this.notificationService.create(
        `${
          user.username
        } just made a withdrawal request of ${formatNumber.toDollar(
          amount
        )} awaiting for your approval`,
        NotificationCategory.WITHDRAWAL,
        withdrawal,
        NotificationForWho.ADMIN,
        withdrawal.status,
        UserEnvironment.LIVE
      )
      transactionInstances.push(adminNotification)

      await this.transactionManagerService.execute(transactionInstances)

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Withdrawal has been registered successfully',
        data: { withdrawal: withdrawalInstance.model.collectRaw() },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to register this withdrawal, please try again'
      )
    }
  }

  public async get(
    withdrawalId: AppObjectId,
    fromAllAccounts: boolean = true,
    userId?: AppObjectId
  ): Promise<IWithdrawalObject> {
    return (await this.find(withdrawalId, fromAllAccounts, userId)).toObject()
  }

  public delete = async (
    withdrawalId: AppObjectId
  ): THttpResponse<{ withdrawal: IWithdrawal }> => {
    try {
      const withdrawal = await this.find(withdrawalId)

      if (withdrawal.status === WithdrawalStatus.PENDING)
        throw new HttpException(400, 'Withdrawal has not been settled yet')

      await withdrawal.deleteOne()
      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Withdrawal deleted successfully',
        data: { withdrawal },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to delete this withdrawal, please try again'
      )
    }
  }

  public updateStatus = async (
    withdrawalId: AppObjectId,
    status: WithdrawalStatus
  ): THttpResponse<{ withdrawal: IWithdrawal }> => {
    try {
      const transactionInstances: ITransactionInstance<any>[] = []

      const { instance: withdrawalInstance, object: withdrawal } =
        await this._updateStatusTransaction(withdrawalId, status)

      transactionInstances.push(withdrawalInstance)

      const transactionInstance = await this.transactionService.updateStatus(
        withdrawal._id,
        status
      )

      transactionInstances.push(transactionInstance)

      let user

      if (status === WithdrawalStatus.CANCELLED) {
        const fundedUserTransaction = await this.userService.fund(
          withdrawal.user,
          UserAccount.MAIN_BALANCE,
          withdrawal.amount + withdrawal.fee
        )

        transactionInstances.push(fundedUserTransaction.instance)

        user = fundedUserTransaction.object
      } else {
        user = await this.userService.get(withdrawal.user)
      }

      const sendingNotification = await this.notificationService.create(
        `Your withdrawal of ${formatNumber.toDollar(
          withdrawal.amount
        )} was ${status}`,
        NotificationCategory.WITHDRAWAL,
        withdrawal,
        NotificationForWho.USER,
        status,
        UserEnvironment.LIVE,
        user
      )
      transactionInstances.push(sendingNotification)

      await this.transactionManagerService.execute(transactionInstances)

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Status updated successfully',
        data: { withdrawal: withdrawalInstance.model.collectRaw() },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to update this withdrawal status, please try again'
      )
    }
  }

  public fetch = async (
    fromAllAccounts: boolean,
    withdrawalId: AppObjectId,
    userId?: AppObjectId
  ): THttpResponse<{ withdrawal: IWithdrawal }> => {
    try {
      const withdrawal = await this.find(withdrawalId, fromAllAccounts, userId)

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Withdrawal history fetched successfully',
        data: { withdrawal },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to fetch withdrawal history, please try again'
      )
    }
  }

  public fetchAll = async (
    all: boolean,
    userId: AppObjectId
  ): THttpResponse<{ withdrawals: IWithdrawal[] }> => {
    try {
      const withdrawals = await this.withdrawalRepository
        .find({}, all, {
          user: userId,
        })
        .select('-userObject -withdrawalMethod')
        .collectAll()

      await this.withdrawalRepository.populateAll(
        withdrawals,
        'user',
        'userObject',
        'username isDeleted',
        this.userRepository
      )

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Withdrawal history fetched successfully',
        data: { withdrawals },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to fetch withdrawal history, please try again'
      )
    }
  }
}

export default WithdrawalService
