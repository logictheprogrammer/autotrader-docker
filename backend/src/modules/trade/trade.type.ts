import { IInvestment } from '@/modules/investment/investment.interface'
import { ITransaction } from '@/modules/transaction/transaction.interface'
import { INotification } from '@/modules/notification/notification.interface'
import { ITrade } from '@/modules/trade/trade.interface'
import { ITransactionInstance } from '@/modules/transactionManager/transactionManager.interface'
import { IUser } from '../user/user.interface'
import { IReferral } from '../referral/referral.interface'

export type TUpdateTradeStatus = ITransactionInstance<any>[]
