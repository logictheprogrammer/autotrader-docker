import { THttpResponse } from '@/modules/http/http.type'
import AppDocument from '../app/app.document'

export interface ITransferSettings extends AppDocument {
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

  get(): Promise<ITransferSettings | undefined>

  fetch(): THttpResponse<{ transferSettings: ITransferSettings }>
}
