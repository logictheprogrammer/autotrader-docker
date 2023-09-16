import { Document } from 'mongoose'

export interface ITransactionInstance<T extends Document<any, any, any> = any> {
  model: T
  callback: () => Promise<void>
  onFailed: string
}

export interface ITransactionManagerService<
  T extends Document<any, any, any> = any
> {
  execute(transactionInstances: ITransactionInstance<T>[]): Promise<void>
}
