import { Document } from 'mongoose'
import { THttpResponse } from '@/modules/http/http.type'

export interface ITransferSettings extends Document {
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

  get(): Promise<ITransferSettings>

  fetch(): THttpResponse<{ transferSettings: ITransferSettings }>
}
