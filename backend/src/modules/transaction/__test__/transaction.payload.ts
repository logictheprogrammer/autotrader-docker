import { depositA, depositA_id } from '../../deposit/__test__/deposit.payload'
import { userA_id } from '../../user/__test__/user.payload'
import { UserEnvironment } from '../../user/user.enum'
import { TransactionTitle } from '../transaction.enum'

export const transactionA_id = '3145de5d5b1f5b3a5c1b539a'

export const transactionA = {
  user: userA_id,
  amount: 200,
  title: TransactionTitle.DEPOSIT_SUCCESSFUL,
  object: depositA,
  environment: UserEnvironment.LIVE,
}
