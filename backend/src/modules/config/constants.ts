export class SiteConstants {
  static siteName: string = 'Abito Trade'
  // static siteLink: string = 'localhost:3000'
  // static siteLink: string = '192.168.43.54:5173'
  static siteLink: string = '192.168.43.54:3000'
  static siteUrl: string = 'http://' + this.siteLink + '/'
  static siteApi: string = this.siteUrl + 'api/'
  static siteEmail: string = 'support@' + this.siteLink
  static siteAddress: string = 'Texas United State'
  static sitePhone: string = '1243563674'
  static siteLogo: string = this.siteUrl + 'images/logo.png'
}

export class AppConstants {
  static mainBalance: number = 0
  static referralBalance: number = 0
  static demoBalance: number = 1000
  static bonusBalance: number = 50
  static verifyEmailExpiresTime: number = 1000 * 60 * 60
  static resetPasswordExpiresTime: number = 1000 * 60 * 60
}
