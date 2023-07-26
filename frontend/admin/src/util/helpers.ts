import { UserRole, UserStatus } from '@/modules/user/user.enum'

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

  public static toUserStatus(status: UserStatus): string[] {
    switch (status) {
      case UserStatus.ACTIVE:
        return ['Active', 'success']
      case UserStatus.SUSPENDED:
        return ['Suspended', 'warning']
      default:
        return ['', '']
    }
  }
}
