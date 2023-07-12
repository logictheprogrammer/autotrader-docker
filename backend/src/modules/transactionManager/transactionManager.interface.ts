export interface ITransactionInstance<T = Document> {
  model: T
  callback: () => Promise<void>
  onFailed: string
}

export interface ITransactionManagerService<T = any> {
  execute(transactionInstances: ITransactionInstance<T>[]): Promise<void>
}
