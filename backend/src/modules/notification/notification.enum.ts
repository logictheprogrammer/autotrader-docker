import { UserRole } from '@/modules/user/user.enum'

export enum NotificationCategory {
  REFERRAL = 'referral',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  TRADE = 'trade',
  INVESTMENT = 'investment',
}

export enum NotificationForWho {
  ADMIN = UserRole.ADMIN,
  USER = UserRole.USER,
}
