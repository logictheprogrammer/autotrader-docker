import AppRepository from '@/modules/app/app.repository'
import AppDocument from '../app/app.document'

export interface ITransactionInstance<
  T extends AppDocument<any, any, any> = any
> {
  model: AppRepository<T>
  callback: () => Promise<void>
  onFailed: string
}

export interface ITransactionManagerService<
  T extends AppDocument<any, any, any> = any
> {
  execute(transactionInstances: ITransactionInstance<T>[]): Promise<void>
}
