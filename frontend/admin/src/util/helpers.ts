import { DepositMethodStatus } from '@/modules/depositMethod/depositMethod.enum'
import { UserRole, UserStatus } from '@/modules/user/user.enum'
import { WithdrawalMethodStatus } from '@/modules/withdrawalMethod/withdrawalMethod.enum'

export default class Helpers {
  public static toDollar(amount: number) {
    const usdFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    })

    if (amount >= 0) return usdFormatter.format(amount)
    else return '-' + usdFormatter.format(-amount)
  }

  public static toTitleCase(str: string): string {
    return str.replace(
      /\w\S*/g,
      (word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
    )
  }

  public static toUserRole(role: UserRole): string {
    switch (role) {
      case UserRole.USER:
        return 'User'
      case UserRole.ADMIN:
        return 'Admin'
      case UserRole.SUPER_ADMIN:
        return 'Super Admin'
      default:
        return ''
    }
  }

  public static toStatus(
    status: UserStatus | DepositMethodStatus | WithdrawalMethodStatus
  ): string {
    switch (status) {
      case UserStatus.ACTIVE:
      case DepositMethodStatus.ENABLED:
      case WithdrawalMethodStatus.ENABLED:
        return 'success'
      case UserStatus.SUSPENDED:
      case DepositMethodStatus.DISABLED:
      case WithdrawalMethodStatus.DISABLED:
        return 'warning'

      default:
        return ''
    }
  }
}
