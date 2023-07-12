export enum UserRole {
  SUPER_ADMIN = 3,
  ADMIN = 2,
  USER = 1,
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export enum UserAccount {
  MAIN_BALANCE = 'mainBalance',
  REFERRAL_BALANCE = 'referralBalance',
  DEMO_BALANCE = 'demoBalance',
  BONUS_BALANCE = 'bonusBalance',
}

export enum UserEnvironment {
  DEMO = 'demo',
  LIVE = 'live',
}
