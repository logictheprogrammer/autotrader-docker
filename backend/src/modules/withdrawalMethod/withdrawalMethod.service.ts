import { IWithdrawalMethodObject } from './withdrawalMethod.interface'
import { Types } from 'mongoose'
import { Inject, Service } from 'typedi'
import {
  IWithdrawalMethod,
  IWithdrawalMethodService,
} from '@/modules/withdrawalMethod/withdrawalMethod.interface'
import withdrawalMethodModel from '@/modules/withdrawalMethod/withdrawalMethod.model'
import ServiceToken from '@/utils/enums/serviceToken'
import { ICurrencyService } from '@/modules/currency/currency.interface'
import { WithdrawalMethodStatus } from '@/modules/withdrawalMethod/withdrawalMethod.enum'
import ServiceQuery from '@/modules/service/service.query'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import ServiceException from '@/modules/service/service.exception'
import HttpException from '@/modules/http/http.exception'

@Service()
class WithdrawalMethodService implements IWithdrawalMethodService {
  private withdrawalMethodModel = new ServiceQuery<IWithdrawalMethod>(
    withdrawalMethodModel
  )

  public constructor(
    @Inject(ServiceToken.CURRENCY_SERVICE)
    private currencyService: ICurrencyService
  ) {}

  private find = async (
    withdrawalMethodId: Types.ObjectId,
    fromAllAccounts: boolean = true,
    userId?: Types.ObjectId | string
  ): Promise<IWithdrawalMethod> => {
    const withdrawalMethod = await this.withdrawalMethodModel.findById(
      withdrawalMethodId,
      fromAllAccounts,
      userId
    )

    if (!withdrawalMethod)
      throw new HttpException(404, 'Withdrawal method not found')

    return withdrawalMethod
  }

  public create = async (
    currencyId: Types.ObjectId,
    network: string,
    fee: number,
    minWithdrawal: number
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }> => {
    try {
      const currency = await this.currencyService.get(currencyId)

      const withdrawalMethod = await this.withdrawalMethodModel.self.create({
        name: currency.name,
        symbol: currency.symbol,
        logo: currency.logo,
        network,
        fee,
        minWithdrawal,
        status: WithdrawalMethodStatus.ENABLED,
      })
      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Withdrawal method added successfully',
        data: { withdrawalMethod },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to add this withdrawal method, please try again'
      )
    }
  }

  public update = async (
    withdrawalMethodId: Types.ObjectId,
    currencyId: Types.ObjectId,
    network: string,
    fee: number,
    minWithdrawal: number
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }> => {
    try {
      const withdrawalMethod = await this.find(withdrawalMethodId)

      const currency = await this.currencyService.get(currencyId)
      if (!currency) throw new HttpException(404, 'Currency not found')

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
      throw new ServiceException(
        err,
        'Failed to update this withdrawal method, please try again'
      )
    }
  }

  public async get(
    withdrawalMethodId: Types.ObjectId
  ): Promise<IWithdrawalMethodObject> {
    return (await this.find(withdrawalMethodId)).toObject()
  }

  public delete = async (
    withdrawalMethodId: Types.ObjectId
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
      throw new ServiceException(
        err,
        'Failed to delete this withdrawal method, please try again'
      )
    }
  }

  public updateStatus = async (
    withdrawalMethodId: Types.ObjectId,
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
      throw new ServiceException(
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
        withdrawalMethods = await this.withdrawalMethodModel.find()
      } else {
        withdrawalMethods = await this.withdrawalMethodModel.find({
          status: WithdrawalMethodStatus.ENABLED,
        })
      }

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Withdrawal method fetched successfully',
        data: { withdrawalMethods },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to fetch withdrawal method, please try again'
      )
    }
  }
}

export default WithdrawalMethodService
