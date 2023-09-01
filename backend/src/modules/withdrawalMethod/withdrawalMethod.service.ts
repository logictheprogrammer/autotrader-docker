import { IWithdrawalMethodObject } from './withdrawalMethod.interface'
import { Inject, Service } from 'typedi'
import {
  IWithdrawalMethod,
  IWithdrawalMethodService,
} from '@/modules/withdrawalMethod/withdrawalMethod.interface'
import withdrawalMethodModel from '@/modules/withdrawalMethod/withdrawalMethod.model'
import ServiceToken from '@/utils/enums/serviceToken'
import { ICurrencyService } from '@/modules/currency/currency.interface'
import { WithdrawalMethodStatus } from '@/modules/withdrawalMethod/withdrawalMethod.enum'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import AppException from '@/modules/app/app.exception'
import HttpException from '@/modules/http/http.exception'
import AppRepository from '../app/app.repository'
import AppObjectId from '../app/app.objectId'

@Service()
class WithdrawalMethodService implements IWithdrawalMethodService {
  private withdrawalMethodRepository = new AppRepository<IWithdrawalMethod>(
    withdrawalMethodModel
  )

  public constructor(
    @Inject(ServiceToken.CURRENCY_SERVICE)
    private currencyService: ICurrencyService
  ) {}

  private find = async (
    withdrawalMethodId: AppObjectId,
    fromAllAccounts: boolean = true,
    userId?: AppObjectId | string
  ): Promise<IWithdrawalMethod> => {
    const withdrawalMethod = await this.withdrawalMethodRepository
      .findById(withdrawalMethodId, fromAllAccounts, userId)
      .collect()

    if (!withdrawalMethod)
      throw new HttpException(404, 'Withdrawal method not found')

    return withdrawalMethod
  }

  public create = async (
    currencyId: AppObjectId,
    network: string,
    fee: number,
    minWithdrawal: number
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }> => {
    try {
      const currency = await this.currencyService.get(currencyId)

      await this.withdrawalMethodRepository.ifExist(
        { name: currency.name, network },
        'This withdrawal method already exist'
      )

      const withdrawalMethod = await this.withdrawalMethodRepository
        .create({
          currency: currency._id,
          name: currency.name,
          symbol: currency.symbol,
          logo: currency.logo,
          network,
          fee,
          minWithdrawal,
          status: WithdrawalMethodStatus.ENABLED,
        })
        .save()
      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Withdrawal method added successfully',
        data: { withdrawalMethod },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to add this withdrawal method, please try again'
      )
    }
  }

  public update = async (
    withdrawalMethodId: AppObjectId,
    currencyId: AppObjectId,
    network: string,
    fee: number,
    minWithdrawal: number
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }> => {
    try {
      const withdrawalMethod = await this.find(withdrawalMethodId)

      const currency = await this.currencyService.get(currencyId)
      if (!currency) throw new HttpException(404, 'Currency not found')

      withdrawalMethod.currency = currency._id
      withdrawalMethod.name = currency.name
      withdrawalMethod.symbol = currency.symbol
      withdrawalMethod.logo = currency.logo
      withdrawalMethod.network = network
      withdrawalMethod.fee = fee
      withdrawalMethod.minWithdrawal = minWithdrawal

      await withdrawalMethod.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Withdrawal method updated successfully',
        data: { withdrawalMethod },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to update this withdrawal method, please try again'
      )
    }
  }

  public async get(
    withdrawalMethodId: AppObjectId
  ): Promise<IWithdrawalMethodObject> {
    return (await this.find(withdrawalMethodId)).toObject()
  }

  public delete = async (
    withdrawalMethodId: AppObjectId
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }> => {
    try {
      const withdrawalMethod = await this.find(withdrawalMethodId)

      await withdrawalMethod.deleteOne()
      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Withdrawal method deleted successfully',
        data: { withdrawalMethod },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to delete this withdrawal method, please try again'
      )
    }
  }

  public updateStatus = async (
    withdrawalMethodId: AppObjectId,
    status: WithdrawalMethodStatus
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }> => {
    try {
      const withdrawalMethod = await this.find(withdrawalMethodId)

      withdrawalMethod.status = status
      await withdrawalMethod.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Status updated successfully',
        data: { withdrawalMethod },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to update this withdrawal method status, please try again'
      )
    }
  }

  public fetchAll = async (
    all: boolean
  ): THttpResponse<{ withdrawalMethods: IWithdrawalMethod[] }> => {
    try {
      let withdrawalMethods: IWithdrawalMethod[]

      if (all) {
        withdrawalMethods = await this.withdrawalMethodRepository
          .find()
          .collectAll()
      } else {
        withdrawalMethods = await this.withdrawalMethodRepository
          .find({
            status: WithdrawalMethodStatus.ENABLED,
          })
          .collectAll()
      }

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Withdrawal method fetched successfully',
        data: { withdrawalMethods },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to fetch withdrawal method, please try again'
      )
    }
  }
}

export default WithdrawalMethodService
