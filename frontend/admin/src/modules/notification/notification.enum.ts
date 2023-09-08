import type { DepositStatus } from '../deposit/deposit.enum'
import type { TransferStatus } from '../transfer/transfer.enum'
import type { WithdrawalStatus } from '../withdrawal/withdrawal.enum'

export type NotificationStatus =
  | TransferStatus
  | DepositStatus
  | WithdrawalStatus
// | InvestmentStatus
// | ReferralStatus
// | TradeStatus

export enum NotificationCategory {
  REFERRAL = 'referral',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  TRADE = 'trade',
  INVESTMENT = 'investment',
}
