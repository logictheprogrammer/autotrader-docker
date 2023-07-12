import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'

export const TTransaction = Promise
export type TTransaction<O, I> = Promise<{
  object: O
  instance: ITransactionInstance<I>
}>
