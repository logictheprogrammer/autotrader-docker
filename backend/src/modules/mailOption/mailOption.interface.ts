import { Document } from 'mongoose'
import { THttpResponse } from '@/modules/http/http.type'
import { IServiceObject } from '@/modules/service/service.interface'

export interface IMailOptionObject extends IServiceObject {
  name: string
  host: string
  port: number
  tls: boolean
  secure: boolean
  username: string
  password: string
  getPassword(): string
}

export interface IMailOption extends Document {
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
