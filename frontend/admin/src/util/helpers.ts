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
      case ReferralStatus.SUCCESS:
      case PlanStatus.ACTIVE:
        // case InvestmentStatus.RUNNING:
        return 'success'
      case UserStatus.SUSPENDED:
      case DepositMethodStatus.DISABLED:
      case WithdrawalMethodStatus.DISABLED:
      case TransferStatus.REVERSED:
      case PlanStatus.SUSPENDED:
        // case InvestmentStatus.TRADE_ON_HOLD:
        // case InvestmentStatus.MARKET_CLOSED:
        // case InvestmentStatus.INSUFFICIENT_GAS:
        return 'warning'
      case DepositStatus.PENDING:
      case WithdrawalStatus.PENDING:
      case TransferStatus.PENDING:
      case PlanStatus.ON_MAINTENANCE:
        return 'info'
      case DepositStatus.CANCELLED:
      case WithdrawalStatus.CANCELLED:
        return 'danger'
        // case InvestmentStatus.COMPLETED:
        return 'secondary'

      default:
        return ''
    }
  }

  public static toNiceDay(date: Date | string | number) {
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

    const formattedDay = `${month} ${day}, ${year}`
    return formattedDay
  }

  public static toNiceTime(
    date: Date | string | number,
    withseconds: boolean = false
  ) {
    date = new Date(date)

    let hours = date.getHours()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12 // Convert to 12-hour format

    let minutes = date.getMinutes().toString()
    if (+minutes < 10) {
      minutes = '0' + minutes // Manual padding with leading zero
    }

    let seconds = date.getSeconds().toString()
    if (+seconds < 10) {
      seconds = '0' + seconds // Manual padding with leading zero
    }

    const formattedTime = `${hours}:${minutes}${
      withseconds ? ':' + seconds : ''
    } ${ampm}`
    return formattedTime
  }

  public static toNiceDate(
    date: Date | string | number,
    withseconds: boolean = false
  ) {
    return `${Helpers.toNiceDay(date)} ${Helpers.toNiceTime(date, withseconds)}`
  }
}
