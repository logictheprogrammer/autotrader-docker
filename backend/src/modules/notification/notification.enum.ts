import { UserRole } from '@/modules/user/user.enum'

export enum NotificationTitle {
  DEPOSIT_MADE = 'deposit made',
  DEPOSIT_SUCCESSFUL = 'deposit successful',
  DEPOSIT_FAILED = 'deposit failed',
  WITHDRAWAL_REQUEST = 'withdrawal request',
  WITHDRAWAL_SUCCESSFUL = 'withdrawal successful',
  WITHDRAWAL_FAILED = 'withdrawal failed',
  TRANSFER_SENT = 'transfer sent',
  TRANSFER_RECIEVED = 'transfer recieved',
  TRANSFER_REVERSED = 'transfer reversed',
  REFERRAL_EARNINGS = 'referral earnings',
  TRADE_STAKE = 'trade stake',
  TRADE_SETTLED = 'trade settled',
  TRADE_RUNNING = 'trade running',
  TRADE_MARKET_CLOSED = 'market closed',
  TRADE_ON_HOLD = 'market on hold',
  INVESTMENT_PURCHASED = 'investment purchased',
  INVESTMENT_COMPLETED = 'investment completed',
  INVESTMENT_RUNNING = 'investment running',
  INVESTMENT_SUSPENDED = 'investment suspended',
  INVESTMENT_INSUFFICIENT_GAS = 'insufficient gas',
  INVESTMENT_REFILLING = 'investment refilling',
  INVESTMENT_ON_MAINTANACE = 'plan on maintanace',
  INVESTMENT_AWAITING_TRADE = 'awaiting trade',
  INVESTMENT_PROCESSING_TRADE = 'processing trade',
}

export enum NotificationForWho {
  ADMIN = UserRole.ADMIN,
  USER = UserRole.USER,
}
