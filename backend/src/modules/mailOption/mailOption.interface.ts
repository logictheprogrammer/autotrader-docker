import baseObjectInterface from '@/core/baseObjectInterface'
import baseModelInterface from '@/core/baseModelInterface'
import { FilterQuery } from 'mongoose'

export interface IMailOptionObject extends baseObjectInterface {
  name: string
  host: string
  port: number
  tls: boolean
  secure: boolean
  username: string
  password: string
}

// @ts-ignore
export interface IMailOption extends baseModelInterface, IMailOptionObject {
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
  ): Promise<IMailOptionObject>

  fetch(filter: FilterQuery<IMailOption>): Promise<IMailOptionObject>

  fetchAll(filter: FilterQuery<IMailOption>): Promise<IMailOptionObject[]>
}
