import { IFailedTransactionDoc } from '@/modules/failedTransaction/failedTransaction.interface'
import { THttpResponse } from '@/modules/http/http.type'

export interface ISendMailService {
  sendDeveloperMail(subject: string, content: string): Promise<void>

  sendDeveloperErrorMail(err: any): Promise<void>

  sendDeveloperFailedTransactionMail(
    failedTransactions: IFailedTransactionDoc[]
  ): Promise<void>

  sendAdminMail(subject: string, content: string): Promise<void>

  sendAdminFailedTransactionMail(
    failedTransactions: IFailedTransactionDoc[]
  ): Promise<void>

  sendCustomMail(
    email: string,
    subject: string,
    heading: string,
    content: string
  ): THttpResponse
}
