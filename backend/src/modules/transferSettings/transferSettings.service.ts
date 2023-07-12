import { Service } from 'typedi'
import {
  ITransferSettings,
  ITransferSettingsService,
} from '@/modules/transferSettings/transferSettings.interface'
import transferSettingsModel from '@/modules/transferSettings/transferSettings.model'
import ServiceQuery from '@/modules/service/service.query'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import ServiceException from '@/modules/service/service.exception'
import HttpException from '@/modules/http/http.exception'

@Service()
class TransferSettingsService implements ITransferSettingsService {
  private transferSettingsModel = new ServiceQuery<ITransferSettings>(
    transferSettingsModel
  )

  public async create(
    approval: boolean,
    fee: number
  ): THttpResponse<{ transferSettings: ITransferSettings }> {
    try {
      const transferSettings = await this.transferSettingsModel.self.create({
        approval,
        fee,
      })

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Transfer Settings Created',
        data: { transferSettings },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to create transfer settings, please try again'
      )
    }
  }

  public update = async (
    approval: boolean,
    fee: number
  ): THttpResponse<{ transferSettings: ITransferSettings }> => {
    try {
      await this.transferSettingsModel.self.updateOne(
        {},
        {
          approval,
          fee,
        }
      )

      const transferSettings = await this.get()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Transfer Settings Updated',
        data: { transferSettings },
      }
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to update transfer settings, please try again'
      )
    }
  }

  public get = async (): Promise<ITransferSettings> => {
    try {
      const transferSettings = await this.transferSettingsModel.findOne({})

      if (!transferSettings)
        throw new HttpException(404, 'Transfer settings not found')

      return transferSettings
    } catch (err: any) {
      throw new ServiceException(
        err,
        'Unable to fetch transfer settings, please try again'
      )
    }
  }

  public fetch = async (): THttpResponse<{
    transferSettings: ITransferSettings
  }> => {
    const transferSettings = await this.get()

    return {
      status: HttpResponseStatus.SUCCESS,
      message: 'Transfer Settings fetched',
      data: { transferSettings },
    }
  }
}

export default TransferSettingsService
