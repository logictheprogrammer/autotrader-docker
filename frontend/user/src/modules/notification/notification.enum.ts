export enum NotificationTitle {
  DEPOSIT_MADE = 'deposit made',
  DEPOSIT_SUCCESSFUL = 'deposit successful',
  DEPOSIT_FAILED = 'deposit failed',
  WITHDRAWAL_REQUEST = 'withdrawal request',
  WITHDRAWAL_SUCCESSFUL = 'withdrawal successful',
  WITHDRAWAL_FAILED = 'withdrawal failed',
  TRANSFER_SENT = 'transfer sent',
  TRANSFER_RECEIVED = 'transfer received',
  TRANSFER_REVERSED = 'transfer reversed',
  REFERRAL_EARNINGS = 'referral earnings',
  INVESTMENT_PURCHASED = 'investment purchased',
  INVESTMENT_COMPLETED = 'investment completed',
  INVESTMENT_RUNNING = 'investment running',
  INVESTMENT_SUSPENDED = 'investment suspended',
}

export enum NotificationForWho {
  ADMIN = UserRole.ADMIN,
  USER = UserRole.USER,
}
