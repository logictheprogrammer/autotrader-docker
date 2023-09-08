import type { IDeposit } from '../deposit/deposit.interface'
import type { ITransfer } from '../transfer/transfer.interface'
import type { IWithdrawal } from '../withdrawal/withdrawal.interface'
import type { TransactionCategory, TransactionStatus } from './transaction.enum'

export interface ITransaction {
  __v: number
  _id: string
  updatedAt: string
  createdAt: string
  user: string
  status: TransactionStatus
  categoryName: TransactionCategory
  categoryObject: IDeposit | IWithdrawal | ITransfer
  amount: number
  stake: number
}
