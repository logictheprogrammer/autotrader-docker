import { THttpResponse } from '@/modules/http/http.type'
import { Document } from 'mongoose'

export interface ITransferSettings extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  approval: boolean
  fee: number
}

export interface ITransferSettingsService {
  create(
    approval: boolean,
    fee: number
  ): THttpResponse<{ transferSettings: ITransferSettings }>

  update(
    approval: boolean,
    fee: number
  ): THttpResponse<{ transferSettings: ITransferSettings }>

  get(): Promise<ITransferSettings | null>

  fetch(): THttpResponse<{ transferSettings: ITransferSettings }>
}
