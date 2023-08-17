import { INotification } from '../notification/notification.interface'
import { IReferral } from '../referral/referral.interface'
import { ITransaction } from '../transaction/transaction.interface'
import { ITransactionInstance } from '../transactionManager/transactionManager.interface'
import { IUser } from '../user/user.interface'
import { IInvestment } from './investment.interface'

export type TUpdateInvestmentStatus = ITransactionInstance<any>[]
