import { Types } from 'mongoose'
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
import ServiceQuery from '@/modules/service/service.query'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import ServiceException from '@/modules/service/service.exception'
import HttpException from '@/modules/http/http.exception'

@Service()
class DepositMethodService implements IDepositMethodService {
  private depositMethodModel = new ServiceQuery<IDepositMethod>(
    depositMethodModel
  )

  public constructor(
    @Inject(ServiceToken.CURRENCY_SERVICE)
    private currencyService: ICurrencyService
  ) {}

  private async find(depositMethodId: Types.ObjectId): Promise<IDepositMethod> {
    const depositMethod = await this.depositMethodModel.findById(
      depositMethodId
    )

    if (!depositMethod) throw new HttpException(404, 'Deposit method not found')

    return depositMethod
  }

  public create = async (
    currencyId: Types.ObjectId,
    address: string,
    network: string,
    fee: number,
    minDeposit: number
  ): THttpResponse<{ depositMethod: IDepositMethod }> => {
    try {
      const currency = await this.currencyService.get(currencyId)

      const depositMethod = await this.depositMethodModel.self.create({
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
      throw new ServiceException(
        err,
        'Failed to add this deposit method, please try again'
      )
    }
  }

  public update = async (
    depositMethodId: Types.ObjectId,
    currencyId: Types.ObjectId,
    address: string,
    network: string,
    fee: number,
    minDeposit: number
  ): THttpResponse<{ depositMethod: IDepositMethod }> => {
    try {
      const depositMethod = await this.find(depositMethodId)

      const currency = await this.currencyService.get(currencyId)

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
      throw new ServiceException(
        err,
        'Failed to update this deposit method, please try again'
      )
    }
  }

  public async get(
    depositMethodId: Types.ObjectId
  ): Promise<IDepositMethodObject> {
    try {
      const depositMethod = await this.depositMethodModel.findOne({
        _id: depositMethodId,
        status: DepositMethodStatus.ENABLED,
      })

      if (!depositMethod)
        throw new HttpException(404, 'Deposit method not found')

      return depositMethod.toObject()
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to get deposit method, please try again'
      )
    }
  }

  public delete = async (
    depositMethodId: Types.ObjectId
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
      throw new ServiceException(
        err,
        'Failed to delete this deposit method, please try again'
      )
    }
  }

  public updateStatus = async (
    depositMethodId: Types.ObjectId,
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
      throw new ServiceException(
        err,
        'Failed to update this deposit method status, please try again'
      )
    }
  }

  public async updateMode(
    depositMethodId: Types.ObjectId,
    autoUpdate: boolean
  ): THttpResponse<{ depositMethod: IDepositMethod }> {
    try {
      const depositMethod = await this.find(depositMethodId)

      depositMethod.autoUpdate = autoUpdate

      await depositMethod.save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: `Deposit method price updating is now on ${
          autoUpdate ? 'auto mode' : 'manual mode'
        }`,
        data: { depositMethod },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to update price mode, please try again'
      )
    }
  }

  public async updatePrice(
    depositMethodId: Types.ObjectId,
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
      throw new ServiceException(
        err,
        'Unable to update deposit method price, please try again'
      )
    }
  }

  public fetchAll = async (
    all: boolean
  ): THttpResponse<{ depositMethods: IDepositMethod[] }> => {
    try {
      const depositMethods = await this.depositMethodModel.find({}, all, {
        status: DepositMethodStatus.ENABLED,
      })

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Deposit method fetched successfully',
        data: { depositMethods },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Failed to fetch deposit method, please try again'
      )
    }
  }
}

export default DepositMethodService