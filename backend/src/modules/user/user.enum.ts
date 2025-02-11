export enum UserRole {
  USER = 1,
  ADMIN = 2,
  SUPER_ADMIN = 3,
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export enum UserAccount {
  PROFIT = 'profit',
  MAIN_BALANCE = 'mainBalance',
  REFERRAL_BALANCE = 'referralBalance',
  DEMO_BALANCE = 'demoBalance',
  BONUS_BALANCE = 'bonusBalance',
}

export enum UserEnvironment {
  DEMO = 'demo',
  LIVE = 'live',
}
