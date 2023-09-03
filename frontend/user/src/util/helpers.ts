import { DepositStatus } from '@/modules/deposit/deposit.enum'
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

  public static fromCamelToTitleCase(input: string): string {
    const words = input.replace(/([a-z])([A-Z])/g, '$1 $2').split(' ')
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
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

  public static toStatus(status: string): string {
    switch (status) {
      case UserStatus.ACTIVE:
      case DepositMethodStatus.ENABLED:
      case WithdrawalMethodStatus.ENABLED:
      case DepositStatus.APPROVED:
      case WithdrawalStatus.APPROVED:
      case TransferStatus.SUCCESSFUL:
        return 'success'
      case UserStatus.SUSPENDED:
      case DepositMethodStatus.DISABLED:
      case WithdrawalMethodStatus.DISABLED:
      case TransferStatus.REVERSED:
        return 'warning'
      case DepositStatus.PENDING:
      case WithdrawalStatus.PENDING:
      case TransferStatus.PENDING:
        return 'info'
      case DepositStatus.CANCELLED:
      case WithdrawalStatus.CANCELLED:
        return 'danger'

      default:
        return ''
    }
  }
}
