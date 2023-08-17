import { THttpResponse } from '@/modules/http/http.type'
import { IAppObject } from '@/modules/app/app.interface'
import AppDocument from '../app/app.document'

export interface IMailOptionObject extends IAppObject {
  name: string
  host: string
  port: number
  tls: boolean
  secure: boolean
  username: string
  password: string
  getPassword(): string
}

export interface IMailOption extends AppDocument {
  __v: number
  updatedAt: Date
  createdAt: Date
  name: string
  host: string
  port: number
  tls: boolean
  secure: boolean
  username: string
  password: string
  getPassword(): string
}

export interface IMailOptionService {
  create(
    name: string,
    host: string,
    port: number,
    tls: boolean,
    secure: boolean,
    username: string,
    password: string
  ): THttpResponse<{ mailOption: IMailOption }>

  get(mailOptionName: string): Promise<IMailOption>

  // getAll(): Promise<IMailOption[]>
}
