import 'reflect-metadata'
import { Container } from 'typedi'
import PlanService from '@/modules/plan/plan.service'
import { IPlanService } from '@/modules/plan/plan.interface'
import MailOptionService from '@/modules/mailOption/mailOption.service'
import { IMailOptionService } from '@/modules/mailOption/mailOption.interface'
import { IMailService } from '@/modules/mail/mail.interface'
import { IUserService } from '@/modules/user/user.interface'
import PlanController from '@/modules/plan/plan.controller'
import UserController from '@/modules/user/user.controller'
import MailOptionController from '@/modules/mailOption/mailOption.controller'
import UserService from '@/modules/user/user.service'
import ServiceToken from '@/core/serviceToken'
import MailService from '@/modules/mail/mail.service'
import ConfigController from '@/modules/config/config.controller'
import { IAuthService } from '@/modules/auth/auth.interface'
import AuthService from '@/modules/auth/auth.service'
import AuthController from '@/modules/auth/auth.controller'
import { IReferralSettingsService } from '@/modules/referralSettings/referralSettings.interface'
import ReferralSettingsService from '@/modules/referralSettings/referralSettings.service'
import ReferralSettingsController from '@/modules/referralSettings/referralSettings.controller'
import { INotificationService } from '@/modules/notification/notification.interface'
import NotificationService from '@/modules/notification/notification.service'
import { IReferralService } from '@/modules/referral/referral.interface'
import ReferralService from '@/modules/referral/referral.service'
import { IEmailVerificationService } from '@/modules/emailVerification/emailVerification.interface'
import EmailVerificationService from '@/modules/emailVerification/emailVerification.service'
import { IResetPasswordService } from '@/modules/resetPassword/resetPassword.interface'
import ResetPasswordService from '@/modules/resetPassword/resetPassword.service'
import { ISendMailService } from '@/modules/sendMail/sendMail.interface'
import SendMailService from '@/modules/sendMail/sendMail.service'
import SendMailController from '@/modules/sendMail/sendMail.controller'
import { IActivityService } from '@/modules/activity/activity.interface'
import ActivityService from '@/modules/activity/activity.service'
import ReferralController from '@/modules/referral/referral.controller'
import { ICurrencyService } from '@/modules/currency/currency.interface'
import CurrencyService from '@/modules/currency/currency.service'
import CurrencyController from '@/modules/currency/currency.controller'
import { IDepositMethodService } from '@/modules/depositMethod/depositMethod.interface'
import DepositMethodService from '@/modules/depositMethod/depositMethod.service'
import DepositMethodController from '@/modules/depositMethod/depositMethod.controller'
import { IWithdrawalMethodService } from '@/modules/withdrawalMethod/withdrawalMethod.interface'
import WithdrawalMethodService from '@/modules/withdrawalMethod/withdrawalMethod.service'
import WithdrawalMethodController from '@/modules/withdrawalMethod/withdrawalMethod.controller'
import { ITransactionService } from '@/modules/transaction/transaction.interface'
import TransactionService from '@/modules/transaction/transaction.service'
import { IDepositService } from '@/modules/deposit/deposit.interface'
import DepositService from '@/modules/deposit/deposit.service'
import DepositController from '@/modules/deposit/deposit.controller'
import { IWithdrawalService } from '@/modules/withdrawal/withdrawal.interface'
import WithdrawalService from '@/modules/withdrawal/withdrawal.service'
import WithdrawalController from '@/modules/withdrawal/withdrawal.controller'
import ActivityController from '@/modules/activity/activity.controller'
import TransactionController from '@/modules/transaction/transaction.controller'
import { ITransferSettingsService } from '@/modules/transferSettings/transferSettings.interface'
import TransferSettingsService from '@/modules/transferSettings/transferSettings.service'
import { ITransferService } from '@/modules/transfer/transfer.interface'
import TransferService from '@/modules/transfer/transfer.service'
import TransferSettingsController from '@/modules/transferSettings/transferSettings.controller'
import TransferController from '@/modules/transfer/transfer.controller'
import { IAssetService } from '@/modules/asset/asset.interface'
import AssetService from '@/modules/asset/asset.service'
import AssetController from '@/modules/asset/asset.controller'
import { IInvestmentService } from '@/modules/investment/investment.interface'
import InvestmentService from '@/modules/investment/investment.service'
import InvestmentController from '@/modules/investment/investment.controller'
import NotificationController from '@/modules/notification/notification.controller'
import { IPairService } from '@/modules/pair/pair.interface'
import PairService from '@/modules/pair/pair.service'
import PairController from '@/modules/pair/pair.controller'
import { IMathService, IMathUtility } from '@/modules/math/math.interface'
import MathService from '@/modules/math/math.service'
import { ITradeService } from '@/modules/trade/trade.interface'
import TradeService from '@/modules/trade/trade.service'
import TradeController from '@/modules/trade/trade.controller'
import { IForecastService } from '@/modules/forecast/forecast.interface'
import ForecastService from '@/modules/forecast/forecast.service'
import MathUtility from './modules/math/math.utility'
import ForecastController from './modules/forecast/forecast.controller'
import { IController } from './core/utils'

export const mathUtility = Container.get<IMathUtility>(MathUtility)
Container.set<IMathUtility>(ServiceToken.MATH_UTILITY, mathUtility)

export const mathService = Container.get<IMathService>(MathService)
Container.set<IMathService>(ServiceToken.MATH_SERVICE, mathService)

export const notificationService =
  Container.get<INotificationService>(NotificationService)
Container.set<INotificationService>(
  ServiceToken.NOTIFICATION_SERVICE,
  notificationService
)

export const activityService = Container.get<IActivityService>(ActivityService)
Container.set<IActivityService>(ServiceToken.ACTIVITY_SERVICE, activityService)

export const resetPasswordService =
  Container.get<IResetPasswordService>(ResetPasswordService)
Container.set<IResetPasswordService>(
  ServiceToken.RESET_PASSWORD_SERVICE,
  resetPasswordService
)

export const emailVerificationService =
  Container.get<IEmailVerificationService>(EmailVerificationService)
Container.set<IEmailVerificationService>(
  ServiceToken.EMAIL_VERIFICATION_SERVICE,
  emailVerificationService
)

export const currencyService = Container.get<ICurrencyService>(CurrencyService)
Container.set<ICurrencyService>(ServiceToken.CURRENCY_SERVICE, currencyService)

export const assetService = Container.get<IAssetService>(AssetService)
Container.set<IAssetService>(ServiceToken.ASSET_SERVICE, assetService)

export const mailOptionService =
  Container.get<IMailOptionService>(MailOptionService)
Container.set<IMailOptionService>(
  ServiceToken.MAIL_OPTION_SERVICE,
  mailOptionService
)

export const mailService = Container.get<IMailService>(MailService)
Container.set<IMailService>(ServiceToken.MAIL_SERVICE, mailService)

export const sendMailService = Container.get<ISendMailService>(SendMailService)
Container.set<ISendMailService>(ServiceToken.SEND_MAIL_SERVICE, sendMailService)

export const pairService = Container.get<IPairService>(PairService)
Container.set<IPairService>(ServiceToken.PAIR_SERVICE, pairService)

export const planService = Container.get<IPlanService>(PlanService)
Container.set<IPlanService>(ServiceToken.PLAN_SERVICE, planService)

export const referralSettingsService = Container.get<IReferralSettingsService>(
  ReferralSettingsService
)
Container.set<IReferralSettingsService>(
  ServiceToken.REFERRAL_SETTINGS_SERVICE,
  referralSettingsService
)

export const transferSettingsService = Container.get<ITransferSettingsService>(
  TransferSettingsService
)
Container.set<ITransferSettingsService>(
  ServiceToken.TRANSFER_SETTINGS_SERVICE,
  transferSettingsService
)

export const transactionService =
  Container.get<ITransactionService>(TransactionService)
Container.set<ITransactionService>(
  ServiceToken.TRANSACTION_SERVICE,
  transactionService
)

export const depositMethodService =
  Container.get<IDepositMethodService>(DepositMethodService)
Container.set<IDepositMethodService>(
  ServiceToken.DEPOSIT_METHOD_SERVICE,
  depositMethodService
)

export const withdrawalMethodService = Container.get<IWithdrawalMethodService>(
  WithdrawalMethodService
)
Container.set<IWithdrawalMethodService>(
  ServiceToken.WITHDRAWAL_METHOD_SERVICE,
  withdrawalMethodService
)

export const userService = Container.get<IUserService>(UserService)
Container.set<IUserService>(ServiceToken.USER_SERVICE, userService)

export const referralService = Container.get<IReferralService>(ReferralService)
Container.set<IReferralService>(ServiceToken.REFERRAL_SERVICE, referralService)

export const transferService = Container.get<ITransferService>(TransferService)
Container.set<ITransferService>(ServiceToken.TRANSFER_SERVICE, transferService)

export const depositService = Container.get<IDepositService>(DepositService)
Container.set<IDepositService>(ServiceToken.DEPOSIT_SERVICE, depositService)

export const withdrawalService =
  Container.get<IWithdrawalService>(WithdrawalService)
Container.set<IWithdrawalService>(
  ServiceToken.WITHDRAWAL_SERVICE,
  withdrawalService
)

export const investmentService =
  Container.get<IInvestmentService>(InvestmentService)
Container.set<IInvestmentService>(
  ServiceToken.INVESTMENT_SERVICE,
  investmentService
)

export const tradeService = Container.get<ITradeService>(TradeService)
Container.set<ITradeService>(ServiceToken.TRADE_SERVICE, tradeService)

export const forecastService = Container.get<IForecastService>(ForecastService)
Container.set<IForecastService>(ServiceToken.FORECAST_SERVICE, forecastService)

export const authService = Container.get<IAuthService>(AuthService)
Container.set<IAuthService>(ServiceToken.AUTH_SERVICE, authService)

const sendMailController = Container.get(SendMailController)
const authController = Container.get(AuthController)
const userController = Container.get(UserController)
const planController = Container.get(PlanController)
const mailOptionController = Container.get(MailOptionController)
const configController = Container.get(ConfigController)
const referralSettingsController = Container.get(ReferralSettingsController)
const referralController = Container.get(ReferralController)
const currencyController = Container.get(CurrencyController)
const depositMethodController = Container.get(DepositMethodController)
const withdrawalMethodController = Container.get(WithdrawalMethodController)
const depositController = Container.get(DepositController)
const withdrawalController = Container.get(WithdrawalController)
const activityController = Container.get(ActivityController)
const transactionController = Container.get(TransactionController)
const transferSettingsController = Container.get(TransferSettingsController)
const transferController = Container.get(TransferController)
const assetController = Container.get(AssetController)
const investmentController = Container.get(InvestmentController)
const notificationController = Container.get(NotificationController)
const pairController = Container.get(PairController)
const tradeController = Container.get(TradeController)
const forecastController = Container.get(ForecastController)

export const controllers: IController[] = [
  referralSettingsController,
  sendMailController,
  authController,
  userController,
  planController,
  mailOptionController,
  configController,
  referralController,
  currencyController,
  depositMethodController,
  withdrawalMethodController,
  depositController,
  withdrawalController,
  activityController,
  transactionController,
  transferSettingsController,
  transferController,
  assetController,
  investmentController,
  notificationController,
  pairController,
  tradeController,
  forecastController,
]
