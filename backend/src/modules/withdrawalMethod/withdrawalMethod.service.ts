import { IWithdrawalMethodObject } from './withdrawalMethod.interface'
import { Inject, Service } from 'typedi'
import {
  IWithdrawalMethod,
  IWithdrawalMethodService,
} from '@/modules/withdrawalMethod/withdrawalMethod.interface'
import withdrawalMethodModel from '@/modules/withdrawalMethod/withdrawalMethod.model'
import { ICurrencyService } from '@/modules/currency/currency.interface'
import { WithdrawalMethodStatus } from '@/modules/withdrawalMethod/withdrawalMethod.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import ServiceToken from '@/core/serviceToken'
import {
  BadRequestError,
  NotFoundError,
  RequestConflictError,
  ServiceError,
} from '@/core/apiError'

@Service()
class WithdrawalMethodService implements IWithdrawalMethodService {
  private withdrawalMethodModel = withdrawalMethodModel

  public constructor(
    @Inject(ServiceToken.CURRENCY_SERVICE)
    private currencyService: ICurrencyService
  ) {}

  public async create(
    currencyId: ObjectId,
    network: string,
    fee: number,
    minWithdrawal: number
  ): Promise<IWithdrawalMethodObject> {
    try {
      if (fee >= minWithdrawal)
        throw new BadRequestError('Min withdrawal must be greater than the fee')

      const currency = await this.currencyService.fetch({ _id: currencyId })

      const withdrawalMethodExist = await this.withdrawalMethodModel.findOne({
        name: currency.name,
        network,
      })

      if (withdrawalMethodExist)
        throw new RequestConflictError('This withdrawal method already exist')

      const withdrawalMethod = await this.withdrawalMethodModel.create({
        currency: currency._id,
        name: currency.name,
        symbol: currency.symbol,
        logo: currency.logo,
        network,
        fee,
        minWithdrawal,
        status: WithdrawalMethodStatus.ENABLED,
      })
      return withdrawalMethod
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to add this withdrawal method, please try again'
      )
    }
  }

  public async update(
    filter: FilterQuery<IWithdrawalMethod>,
    currencyId: ObjectId,
    network: string,
    fee: number,
    minWithdrawal: number
  ): Promise<IWithdrawalMethodObject> {
    try {
      if (fee >= minWithdrawal)
        throw new BadRequestError('Min withdrawal must be greater than the fee')

      const withdrawalMethod = await this.withdrawalMethodModel.findOne(filter)

      if (!withdrawalMethod)
        throw new NotFoundError('Withdrawal method not found')

      const currency = await this.currencyService.fetch({ _id: currencyId })

      const withdrawalMethodExist = await this.withdrawalMethodModel.findOne({
        name: currency.name,
        network,
        _id: { $ne: withdrawalMethod._id },
      })

      if (withdrawalMethodExist)
        throw new RequestConflictError('This withdrawal method already exist')

      withdrawalMethod.currency = currency._id
      withdrawalMethod.name = currency.name
      withdrawalMethod.symbol = currency.symbol
      withdrawalMethod.logo = currency.logo
      withdrawalMethod.network = network
      withdrawalMethod.fee = fee
      withdrawalMethod.minWithdrawal = minWithdrawal

      await withdrawalMethod.save()

      return withdrawalMethod
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to update this withdrawal method, please try again'
      )
    }
  }

  public async fetch(
    filter: FilterQuery<IWithdrawalMethod>
  ): Promise<IWithdrawalMethodObject> {
    const withdrawalMethod = await this.withdrawalMethodModel.findOne(filter)
    if (!withdrawalMethod)
      throw new NotFoundError('Withdrawal method not found')

    return withdrawalMethod
  }

  public async delete(
    filter: FilterQuery<IWithdrawalMethod>
  ): Promise<IWithdrawalMethodObject> {
    try {
      const withdrawalMethod = await this.withdrawalMethodModel.findOne(filter)
      if (!withdrawalMethod)
        throw new NotFoundError('Withdrawal method not found')

      await withdrawalMethod.deleteOne()
      return withdrawalMethod
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to delete this withdrawal method, please try again'
      )
    }
  }

  public async updateStatus(
    filter: FilterQuery<IWithdrawalMethod>,
    status: WithdrawalMethodStatus
  ): Promise<IWithdrawalMethodObject> {
    try {
      const withdrawalMethod = await this.withdrawalMethodModel.findOne(filter)
      if (!withdrawalMethod)
        throw new NotFoundError('Withdrawal method not found')

      withdrawalMethod.status = status
      await withdrawalMethod.save()

      return withdrawalMethod
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to update this withdrawal method status, please try again'
      )
    }
  }

  public async fetchAll(
    filter: FilterQuery<IWithdrawalMethod>
  ): Promise<IWithdrawalMethodObject[]> {
    try {
      return await this.withdrawalMethodModel.find(filter)
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to fetch withdrawal method, please try again'
      )
    }
  }
}

export default WithdrawalMethodService
