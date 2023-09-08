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

  public static toNiceDate(date: Date | string | number) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]

    date = new Date(date)

    const month = months[date.getMonth()]
    const day = date.getDate()
    const year = date.getFullYear()

    let hours = date.getHours()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12 // Convert to 12-hour format

    let minutes = date.getMinutes().toString()
    if (+minutes < 10) {
      minutes = '0' + minutes // Manual padding with leading zero
    }

    const formattedDate = `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`
    return formattedDate
  }
}
