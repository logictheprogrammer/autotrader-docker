import { ITransaction } from '../../../modules/transaction/transaction.interface'
import { depositA, depositA_id } from '../../deposit/__test__/deposit.payload'
import { DepositStatus } from '../../deposit/deposit.enum'
import { userA, userA_id } from '../../user/__test__/user.payload'
import { UserEnvironment } from '../../user/user.enum'
import { TransactionCategory } from '../transaction.enum'

// @ts-ignore
export const transactionModelReturn: ITransaction = {
  save: jest.fn(),
  _id: 'transaction id',
}

export const transactionA_id = '3145de5d5b1f5b3a5c1b539a'

export const transactionA = {
  user: userA_id,
  userObject: userA,
  amount: 200,
  categoryName: TransactionCategory.DEPOSIT,
  category: depositA_id,
  categoryObject: depositA,
  status: DepositStatus.APPROVED,
  environment: UserEnvironment.LIVE,
}
