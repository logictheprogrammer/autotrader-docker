import { IBaseObject } from '@/util/interface'
import { IUser } from '../user/user.interface'
import type { TransactionTitle } from './transaction.enum'
import { UserEnvironment } from '../user/user.enum'

export interface ITransaction extends IBaseObject {
  user?: IUser
  title: TransactionTitle
  object?: IBaseObject
  amount: number
  environment: UserEnvironment
}
