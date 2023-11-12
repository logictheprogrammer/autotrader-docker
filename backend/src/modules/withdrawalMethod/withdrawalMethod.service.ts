import { IWithdrawalMethodObject } from './withdrawalMethod.interface'
import { Inject, Service } from 'typedi'
import {
  IWithdrawalMethod,
  IWithdrawalMethodService,
} from '@/modules/withdrawalMethod/withdrawalMethod.interface'
import { ICurrencyService } from '@/modules/currency/currency.interface'
import { WithdrawalMethodStatus } from '@/modules/withdrawalMethod/withdrawalMethod.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import ServiceToken from '@/core/serviceToken'
import {
  BadRequestError,
  NotFoundError,
  RequestConflictError,
} from '@/core/apiError'
import WithdrawalMethodModel from '@/modules/withdrawalMethod/withdrawalMethod.model'

@Service()
class WithdrawalMethodService implements IWithdrawalMethodService {
  private withdrawalMethodModel = WithdrawalMethodModel

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
    if (fee >= minWithdrawal)
      throw new BadRequestError('Min withdrawal must be greater than the fee')

    const currency = await this.currencyService.fetch({ _id: currencyId })

    const withdrawalMethodExist = await this.withdrawalMethodModel.findOne({
      currency: currency._id,
      network,
    })

    if (withdrawalMethodExist)
      throw new RequestConflictError('This withdrawal method already exist')

    const withdrawalMethod = await this.withdrawalMethodModel.create({
      currency,
      network,
      fee,
      minWithdrawal,
      status: WithdrawalMethodStatus.ENABLED,
    })
    return withdrawalMethod.populate('currency')
  }

  public async update(
    filter: FilterQuery<IWithdrawalMethod>,
    currencyId: ObjectId,
    network: string,
    fee: number,
    minWithdrawal: number
  ): Promise<IWithdrawalMethodObject> {
    if (fee >= minWithdrawal)
      throw new BadRequestError('Min withdrawal must be greater than the fee')

    const withdrawalMethod = await this.withdrawalMethodModel.findOne(filter)

    if (!withdrawalMethod)
      throw new NotFoundError('Withdrawal method not found')

    const currency = await this.currencyService.fetch({ _id: currencyId })

    const withdrawalMethodExist = await this.withdrawalMethodModel.findOne({
      currency: currency._id,
      network,
      _id: { $ne: withdrawalMethod._id },
    })

    if (withdrawalMethodExist)
      throw new RequestConflictError('This withdrawal method already exist')

    withdrawalMethod.currency = currency
    withdrawalMethod.network = network
    withdrawalMethod.fee = fee
    withdrawalMethod.minWithdrawal = minWithdrawal

    await withdrawalMethod.save()

    return withdrawalMethod.populate('currency')
  }

  public async fetch(
    filter: FilterQuery<IWithdrawalMethod>
  ): Promise<IWithdrawalMethodObject> {
    const withdrawalMethod = await this.withdrawalMethodModel
      .findOne(filter)
      .populate('currency')
    if (!withdrawalMethod)
      throw new NotFoundError('Withdrawal method not found')

    return withdrawalMethod
  }

  public async delete(
    filter: FilterQuery<IWithdrawalMethod>
  ): Promise<IWithdrawalMethodObject> {
    const withdrawalMethod = await this.withdrawalMethodModel.findOne(filter)
    if (!withdrawalMethod)
      throw new NotFoundError('Withdrawal method not found')

    await withdrawalMethod.deleteOne()
    return withdrawalMethod
  }

  public async updateStatus(
    filter: FilterQuery<IWithdrawalMethod>,
    status: WithdrawalMethodStatus
  ): Promise<IWithdrawalMethodObject> {
    const withdrawalMethod = await this.withdrawalMethodModel
      .findOne(filter)
      .populate('currency')
    if (!withdrawalMethod)
      throw new NotFoundError('Withdrawal method not found')

    withdrawalMethod.status = status
    await withdrawalMethod.save()

    return withdrawalMethod
  }

  public async fetchAll(
    filter: FilterQuery<IWithdrawalMethod>
  ): Promise<IWithdrawalMethodObject[]> {
    return await this.withdrawalMethodModel.find(filter)
  }

  public async count(filter: FilterQuery<IWithdrawalMethod>): Promise<number> {
    return await this.withdrawalMethodModel.count(filter)
  }
}

export default WithdrawalMethodService
