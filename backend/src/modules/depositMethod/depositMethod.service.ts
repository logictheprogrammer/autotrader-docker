import { Inject, Service } from 'typedi'
import {
  IDepositMethod,
  IDepositMethodObject,
  IDepositMethodService,
} from '@/modules/depositMethod/depositMethod.interface'
import { ICurrencyService } from '@/modules/currency/currency.interface'
import { DepositMethodStatus } from '@/modules/depositMethod/depositMethod.enum'
import { FilterQuery, ObjectId } from 'mongoose'
import {
  BadRequestError,
  NotFoundError,
  RequestConflictError,
  ServiceError,
} from '@/core/apiError'
import ServiceToken from '@/core/serviceToken'
import DepositMethodModel from '@/modules/depositMethod/depositMethod.model'

@Service()
class DepositMethodService implements IDepositMethodService {
  private depositMethodModel = DepositMethodModel

  public constructor(
    @Inject(ServiceToken.CURRENCY_SERVICE)
    private currencyService: ICurrencyService
  ) {}

  public async create(
    currencyId: ObjectId,
    address: string,
    network: string,
    fee: number,
    minDeposit: number
  ): Promise<IDepositMethod> {
    try {
      if (fee >= minDeposit)
        throw new BadRequestError('Min deposit must be greater than the fee')

      const currency = await this.currencyService.fetch({ _id: currencyId })

      const depositMethodExist = await this.depositMethodModel.findOne({
        name: currency.name,
        network,
      })

      if (depositMethodExist)
        throw new RequestConflictError('This deposit method already exist')

      const depositMethod = await this.depositMethodModel.create({
        currency,
        address,
        network,
        fee,
        minDeposit,
        status: DepositMethodStatus.ENABLED,
        autoUpdate: true,
        price: 1,
      })

      return depositMethod
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to add this deposit method, please try again'
      )
    }
  }

  public async update(
    query: FilterQuery<IDepositMethod>,
    currencyId: ObjectId,
    address: string,
    network: string,
    fee: number,
    minDeposit: number
  ): Promise<IDepositMethod> {
    try {
      if (fee >= minDeposit)
        throw new BadRequestError('Min deposit must be greater than the fee')

      const depositMethod = await this.depositMethodModel.findOne(query)

      if (!depositMethod) throw new NotFoundError('Deposit method not found')

      const currency = await this.currencyService.fetch({ _id: currencyId })

      const depositMethodExist = await this.depositMethodModel.findOne({
        name: currency.name,
        network,
        _id: { $ne: depositMethod._id },
      })

      if (depositMethodExist)
        throw new RequestConflictError('This deposit method already exist')

      depositMethod.currency = currency
      depositMethod.address = address
      depositMethod.network = network
      depositMethod.fee = fee
      depositMethod.minDeposit = minDeposit

      await depositMethod.save()

      return depositMethod
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to update this deposit method, please try again'
      )
    }
  }

  public async fetch(
    query: FilterQuery<IDepositMethod>
  ): Promise<IDepositMethodObject> {
    try {
      const depositMethod = await this.depositMethodModel
        .findOne(query)
        .populate('currency')

      if (!depositMethod) throw new NotFoundError('Deposit method not found')

      return depositMethod
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to get deposit method, please try again'
      )
    }
  }

  public async delete(
    query: FilterQuery<IDepositMethod>
  ): Promise<IDepositMethod> {
    try {
      const depositMethod = await this.depositMethodModel
        .findOne(query)
        .populate('currency')

      if (!depositMethod) throw new NotFoundError('Deposit method not found')

      await depositMethod.deleteOne()
      return depositMethod
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to delete this deposit method, please try again'
      )
    }
  }

  public async updateStatus(
    query: FilterQuery<IDepositMethod>,
    status: DepositMethodStatus
  ): Promise<IDepositMethod> {
    try {
      const depositMethod = await this.depositMethodModel
        .findOne(query)
        .populate('currency')

      if (!depositMethod) throw new NotFoundError('Deposit method not found')

      depositMethod.status = status
      await depositMethod.save()

      return depositMethod
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to update this deposit method status, please try again'
      )
    }
  }

  public async updateMode(
    query: FilterQuery<IDepositMethod>,
    autoUpdate: boolean
  ): Promise<IDepositMethod> {
    try {
      const depositMethod = await this.depositMethodModel
        .findOne(query)
        .populate('currency')

      if (!depositMethod) throw new NotFoundError('Deposit method not found')

      depositMethod.autoUpdate = autoUpdate

      await depositMethod.save()

      return depositMethod
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Unable to update price mode, please try again'
      )
    }
  }

  public async updatePrice(
    query: FilterQuery<IDepositMethod>,
    price: number
  ): Promise<IDepositMethod> {
    try {
      const depositMethod = await this.depositMethodModel
        .findOne(query)
        .populate('currency')

      if (!depositMethod) throw new NotFoundError('Deposit method not found')

      if (depositMethod.autoUpdate)
        throw new BadRequestError(
          'Can not update a deposit method price that is on auto update mode'
        )

      depositMethod.price = price

      await depositMethod.save()

      return depositMethod
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Unable to update deposit method price, please try again'
      )
    }
  }

  public async fetchAll(
    query: FilterQuery<IDepositMethod>
  ): Promise<IDepositMethod[]> {
    try {
      return await this.depositMethodModel.find(query).populate('currency')
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Failed to fetch deposit method, please try again'
      )
    }
  }
}

export default DepositMethodService
