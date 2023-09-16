import { withdrawalMethodA } from './__test__/withdrawalMethod.payload'
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
import { ObjectId } from 'mongoose'
import { ErrorCode } from '@/utils/enums/errorCodes.enum'

@Service()
class WithdrawalMethodService implements IWithdrawalMethodService {
  private withdrawalMethodModel = withdrawalMethodModel

  public constructor(
    @Inject(ServiceToken.CURRENCY_SERVICE)
    private currencyService: ICurrencyService
  ) {}

  private find = async (
    withdrawalMethodId: ObjectId,
    fromAllAccounts: boolean = true,
    userId?: ObjectId | string
  ): Promise<IWithdrawalMethod> => {
    let withdrawalMethod

    if (fromAllAccounts) {
      withdrawalMethod = await this.withdrawalMethodModel.findById(
        withdrawalMethodId
      )
    } else {
      withdrawalMethod = await this.withdrawalMethodModel.findOne({
        _id: withdrawalMethodId,
        user: userId,
      })
    }

    if (!withdrawalMethod)
      throw new HttpException(404, 'Withdrawal method not found')

    return withdrawalMethod
  }

  public create = async (
    currencyId: ObjectId,
    network: string,
    fee: number,
    minWithdrawal: number
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }> => {
    try {
      if (fee >= minWithdrawal)
        throw new HttpException(
          400,
          'Min withdrawal must be greater than the fee'
        )

      const currency = await this.currencyService.get(currencyId)

      const withdrawalMethodExist = await this.withdrawalMethodModel.findOne({
        name: currency.name,
        network,
      })

      if (withdrawalMethodExist)
        throw new HttpException(
          ErrorCode.REQUEST_CONFLICT,
          'This withdrawal method already exist'
        )

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
    withdrawalMethodId: ObjectId,
    currencyId: ObjectId,
    network: string,
    fee: number,
    minWithdrawal: number
  ): THttpResponse<{ withdrawalMethod: IWithdrawalMethod }> => {
    try {
      if (fee >= minWithdrawal)
        throw new HttpException(
          400,
          'Min withdrawal must be greater than the fee'
        )

      const withdrawalMethod = await this.find(withdrawalMethodId)

      const currency = await this.currencyService.get(currencyId)

      const withdrawalMethodExist = await this.withdrawalMethodModel.findOne({
        name: currency.name,
        network,
        _id: { $ne: withdrawalMethod._id },
      })

      if (withdrawalMethodExist)
        throw new HttpException(
          ErrorCode.REQUEST_CONFLICT,
          'This withdrawal method already exist'
        )

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
    withdrawalMethodId: ObjectId
  ): Promise<IWithdrawalMethodObject> {
    return (await this.find(withdrawalMethodId)).toObject()
  }

  public delete = async (
    withdrawalMethodId: ObjectId
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
    withdrawalMethodId: ObjectId,
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
      throw new AppException(
        err,
        'Failed to fetch withdrawal method, please try again'
      )
    }
  }
}

export default WithdrawalMethodService
