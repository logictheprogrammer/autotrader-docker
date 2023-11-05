import { Service } from 'typedi'
import {
  ITransferSettings,
  ITransferSettingsObject,
  ITransferSettingsService,
} from '@/modules/transferSettings/transferSettings.interface'
import { NotFoundError } from '@/core/apiError'
import { FilterQuery } from 'mongoose'
import TransferSettingsModel from '@/modules/transferSettings/transferSettings.model'

@Service()
class TransferSettingsService implements ITransferSettingsService {
  private transferSettingsModel = TransferSettingsModel

  public async create(
    approval: boolean,
    fee: number
  ): Promise<ITransferSettingsObject> {
    const transferSettings = await this.transferSettingsModel.create({
      approval,
      fee,
    })

    return transferSettings
  }

  public async update(
    approval: boolean,
    fee: number
  ): Promise<ITransferSettingsObject> {
    const transferSettings = await this.transferSettingsModel.findOne()
    if (!transferSettings)
      throw new NotFoundError('Transfer settings not found')

    transferSettings.approval = approval
    transferSettings.fee = fee

    await transferSettings.save()

    return transferSettings
  }

  public async fetch(
    filter: FilterQuery<ITransferSettings>
  ): Promise<ITransferSettingsObject> {
    const transferSettings = await this.transferSettingsModel.findOne(filter)

    if (!transferSettings)
      throw new NotFoundError('Transfer settings not found')

    return transferSettings
  }
}

export default TransferSettingsService
