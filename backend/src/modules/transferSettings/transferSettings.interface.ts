import baseModelInterface from '@/core/baseModelInterface'
import baseObjectInterface from '@/core/baseObjectInterface'
import { FilterQuery } from 'mongoose'

export interface ITransferSettingsObject extends baseObjectInterface {
  approval: boolean
  fee: number
}

// @ts-ignore
export interface ITransferSettings
  extends baseModelInterface,
    ITransferSettingsObject {}

export interface ITransferSettingsService {
  create(approval: boolean, fee: number): Promise<ITransferSettingsObject>

  update(approval: boolean, fee: number): Promise<ITransferSettingsObject>

  fetch(
    filter: FilterQuery<ITransferSettings>
  ): Promise<ITransferSettingsObject>
}
