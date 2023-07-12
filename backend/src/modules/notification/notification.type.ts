import { DepositStatus } from '../deposit/deposit.enum'
import { InvestmentStatus } from '../investment/investment.enum'
import { ReferralStatus } from '../referral/referral.enum'
import { TradeStatus } from '../trade/trade.enum'
import { TransferStatus } from '../transfer/transfer.enum'
import { WithdrawalStatus } from '../withdrawal/withdrawal.enum'

export type NotificationStatus =
  | TransferStatus
  | DepositStatus
  | WithdrawalStatus
  | InvestmentStatus
  | ReferralStatus
  | TradeStatus
