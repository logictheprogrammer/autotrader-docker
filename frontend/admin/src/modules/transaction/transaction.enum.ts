import type { DepositStatus } from '../deposit/deposit.enum'
import type { WithdrawalStatus } from '../withdrawal/withdrawal.enum'
import type { TransferStatus } from '../transfer/transfer.enum'

export type TransactionStatus =
  | TransferStatus
  | DepositStatus
  | WithdrawalStatus
// | InvestmentStatus
// | ReferralStatus
// | TradeStatus

export enum TransactionCategory {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  REFERRAL = 'referral',
  TRADE = 'trade',
  INVESTMENT = 'investment',
}
