import { Service } from 'typedi'
import {
  ITransferSettings,
  ITransferSettingsObject,
  ITransferSettingsService,
} from '@/modules/transferSettings/transferSettings.interface'
import transferSettingsModel from '@/modules/transferSettings/transferSettings.model'
import { NotFoundError, ServiceError } from '@/core/apiError'
import { FilterQuery } from 'mongoose'

@Service()
class TransferSettingsService implements ITransferSettingsService {
  private transferSettingsModel = transferSettingsModel

  public async create(
    approval: boolean,
    fee: number
  ): Promise<ITransferSettingsObject> {
    try {
      const transferSettings = await this.transferSettingsModel.create({
        approval,
        fee,
      })

      return transferSettings
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Unable to create transfer settings, please try again'
      )
    }
  }

  public async update(
    approval: boolean,
    fee: number
  ): Promise<ITransferSettingsObject> {
    try {
      const transferSettings = await this.transferSettingsModel.findOne()
      if (!transferSettings)
        throw new NotFoundError('Transfer settings not found')

      transferSettings.approval = approval
      transferSettings.fee = fee

      await transferSettings.save()

      return transferSettings
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Unable to update transfer settings, please try again'
      )
    }
  }

  public async fetch(
    filter: FilterQuery<ITransferSettings>
  ): Promise<ITransferSettingsObject> {
    try {
      const transferSettings = await this.transferSettingsModel.findOne(filter)

      if (!transferSettings)
        throw new NotFoundError('Transfer settings not found')

      return transferSettings
    } catch (err: any) {
      throw new ServiceError(
        err,
        'Unable to fetch transfer settings, please try again'
      )
    }
  }
}

export default TransferSettingsService
