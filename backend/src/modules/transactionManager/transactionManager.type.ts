import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import AppDocument from '../app/app.document'

export const TTransaction = Promise
export type TTransaction<O, I extends AppDocument> = Promise<{
  object: O
  instance: ITransactionInstance<I>
}>
