import { Service } from 'typedi'
import {
  ITransferSettings,
  ITransferSettingsService,
} from '@/modules/transferSettings/transferSettings.interface'
import transferSettingsModel from '@/modules/transferSettings/transferSettings.model'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import AppException from '@/modules/app/app.exception'
import HttpException from '@/modules/http/http.exception'
import AppRepository from '../app/app.repository'

@Service()
class TransferSettingsService implements ITransferSettingsService {
  private transferSettingsRepository = new AppRepository<ITransferSettings>(
    transferSettingsModel
  )

  public async create(
    approval: boolean,
    fee: number
  ): THttpResponse<{ transferSettings: ITransferSettings }> {
    try {
      const transferSettings = await this.transferSettingsRepository
        .create({
          approval,
          fee,
        })
        .save()

      return {
        status: HttpResponseStatus.SUCCESS,
        message: 'Transfer Settings Created',
        data: { transferSettings },
      }
    } catch (err: any) {
      throw new AppException(
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
      await this.transferSettingsRepository.updateOne(
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
      throw new AppException(
        err,
        'Unable to update transfer settings, please try again'
      )
    }
  }

  public get = async (): Promise<ITransferSettings> => {
    try {
      const transferSettings = await this.transferSettingsRepository
        .findOne({})
        .collect()

      if (!transferSettings)
        throw new HttpException(404, 'Transfer settings not found')

      return transferSettings
    } catch (err: any) {
      throw new AppException(
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
