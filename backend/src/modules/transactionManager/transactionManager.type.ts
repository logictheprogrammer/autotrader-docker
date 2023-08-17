import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import { Document } from 'mongoose'

export const TTransaction = Promise
export type TTransaction<O, I extends Document> = Promise<{
  object: O
  instance: ITransactionInstance<I>
}>
