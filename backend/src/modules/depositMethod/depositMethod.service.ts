import { Inject, Service } from 'typedi'
import {
  IDepositMethod,
  IDepositMethodObject,
  IDepositMethodService,
} from '@/modules/depositMethod/depositMethod.interface'
import depositMethodModel from '@/modules/depositMethod/depositMethod.model'
import ServiceToken from '@/utils/enums/serviceToken'
import { ICurrencyService } from '@/modules/currency/currency.interface'
import { DepositMethodStatus } from '@/modules/depositMethod/depositMethod.enum'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import AppException from '@/modules/app/app.exception'
import HttpException from '@/modules/http/http.exception'
import { ObjectId } from 'mongoose'
import { ErrorCode } from '@/utils/enums/errorCodes.enum'

@Service()
class DepositMethodService implements IDepositMethodService {
  private depositMethodModel = depositMethodModel

  public constructor(
    @Inject(ServiceToken.CURRENCY_SERVICE)
    private currencyService: ICurrencyService
  ) {}

  private async find(depositMethodId: ObjectId): Promise<IDepositMethod> {
    const depositMethod = await this.depositMethodModel.findById(
      depositMethodId
    )

    if (!depositMethod) throw new HttpException(404, 'Deposit method not found')

    return depositMethod
  }

  public create = async (
    currencyId: ObjectId,
    address: string,
    network: string,
    fee: number,
    minDeposit: number
  ): THttpResponse<{ depositMethod: IDepositMethod }> => {
    try {
      if (fee >= minDeposit)
        throw new HttpException(400, 'Min deposit must be greater than the fee')

      const currency = await this.currencyService.get(currencyId)

      const depositMethodExist = await this.depositMethodModel.findOne({
        name: currency.name,
        network,
      })

      if (depositMethodExist)
        throw new HttpException(
          ErrorCode.REQUEST_CONFLICT,
          'This deposit method already exist'
        )

      const depositMethod = await this.depositMethodModel.create({
        currency: currency._id,
        name: currency.name,
        symbol: currency.symbol,
        logo: currency.logo,
        address,
        network,
        fee,
        minDeposit,
        status: DepositMethodStatus.ENABLED,
        autoUpdate: true,
        price: 1,
      })

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Deposit method added successfully',
        data: { depositMethod },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to add this deposit method, please try again'
      )
    }
  }

  public update = async (
    depositMethodId: ObjectId,
    currencyId: ObjectId,
    address: string,
    network: string,
    fee: number,
    minDeposit: number
  ): THttpResponse<{ depositMethod: IDepositMethod }> => {
    try {
      if (fee >= minDeposit)
        throw new HttpException(400, 'Min deposit must be greater than the fee')

      const depositMethod = await this.find(depositMethodId)

      const currency = await this.currencyService.get(currencyId)

      const depositMethodExist = await this.depositMethodModel.findOne({
        name: currency.name,
        network,
        _id: { $ne: depositMethod._id },
      })

      if (depositMethodExist)
        throw new HttpException(
          ErrorCode.REQUEST_CONFLICT,
          'This deposit method already exist'
        )

      depositMethod.currency = currency._id
      depositMethod.name = currency.name
      depositMethod.symbol = currency.symbol
      depositMethod.logo = currency.logo
      depositMethod.address = address
      depositMethod.network = network
      depositMethod.fee = fee
      depositMethod.minDeposit = minDeposit

      await depositMethod.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Deposit method updated successfully',
        data: { depositMethod },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to update this deposit method, please try again'
      )
    }
  }

  public async get(depositMethodId: ObjectId): Promise<IDepositMethodObject> {
    try {
      const depositMethod = await this.depositMethodModel.findOne({
        _id: depositMethodId,
        status: DepositMethodStatus.ENABLED,
      })

      if (!depositMethod)
        throw new HttpException(404, 'Deposit method not found')

      return depositMethod.toObject({ getters: true })
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to get deposit method, please try again'
      )
    }
  }

  public delete = async (
    depositMethodId: ObjectId
  ): THttpResponse<{ depositMethod: IDepositMethod }> => {
    try {
      const depositMethod = await this.find(depositMethodId)

      await depositMethod.deleteOne()
      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Deposit method deleted successfully',
        data: { depositMethod },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to delete this deposit method, please try again'
      )
    }
  }

  public updateStatus = async (
    depositMethodId: ObjectId,
    status: DepositMethodStatus
  ): THttpResponse<{ depositMethod: IDepositMethod }> => {
    try {
      const depositMethod = await this.find(depositMethodId)

      if (!Object.values(DepositMethodStatus).includes(status))
        throw new HttpException(400, 'Invalid status value')

      depositMethod.status = status
      await depositMethod.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Status updated successfully',
        data: { depositMethod },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to update this deposit method status, please try again'
      )
    }
  }

  public async updateMode(
    depositMethodId: ObjectId,
    autoUpdate: boolean
  ): THttpResponse<{ depositMethod: IDepositMethod }> {
    try {
      const depositMethod = await this.find(depositMethodId)

      depositMethod.autoUpdate = autoUpdate

      const newDepositMethod = await depositMethod.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: `Deposit method price updating is now on ${
          autoUpdate ? 'auto mode' : 'manual mode'
        }`,
        data: { depositMethod: newDepositMethod },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Unable to update price mode, please try again'
      )
    }
  }

  public async updatePrice(
    depositMethodId: ObjectId,
    price: number
  ): THttpResponse<{ depositMethod: IDepositMethod }> {
    try {
      const depositMethod = await this.find(depositMethodId)

      if (depositMethod.autoUpdate)
        throw new HttpException(
          400,
          'Can not update a deposit method price that is on auto update mode'
        )

      depositMethod.price = price

      await depositMethod.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Deposit method price updated successfully',
        data: { depositMethod },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Unable to update deposit method price, please try again'
      )
    }
  }

  public fetchAll = async (
    all: boolean
  ): THttpResponse<{ depositMethods: IDepositMethod[] }> => {
    try {
      let depositMethods

      if (all) {
        depositMethods = await this.depositMethodModel.find()
      } else {
        depositMethods = await this.depositMethodModel.find({
          status: DepositMethodStatus.ENABLED,
        })
      }

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Deposit method fetched successfully',
        data: { depositMethods },
      }
    } catch (err: any) {
      throw new AppException(
        err,
        'Failed to fetch deposit method, please try again'
      )
    }
  }
}

export default DepositMethodService
