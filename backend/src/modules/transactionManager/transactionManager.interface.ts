import AppRepository from '@/modules/app/app.repository'
import { Document } from 'mongoose'

export interface ITransactionInstance<T extends Document<any, any, any> = any> {
  model: AppRepository<T>
  callback: () => Promise<void>
  onFailed: string
}

export interface ITransactionManagerService<
  T extends Document<any, any, any> = any
> {
  execute(transactionInstances: ITransactionInstance<T>[]): Promise<void>
}
