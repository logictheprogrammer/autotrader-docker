import { Inject, Service } from 'typedi'
import {
  ITransactionInstance,
  ITransactionManagerService,
} from '@/modules/transactionManager/transactionManager.interface'
import {
  IFailedTransactionDoc,
  IFailedTransactionService,
  IFailedTransactionObject,
} from '@/modules/failedTransaction/failedTransaction.interface'
import { FailedTransactionStatus } from '@/modules/failedTransaction/failedTransaction.enum'
import ServiceToken from '@/utils/enums/serviceToken'
import { ISendMailService } from '@/modules/sendMail/sendMail.interface'
import AppException from '@/modules/app/app.exception'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import { Document } from 'mongoose'

@Service()
class TransactionManagerService<T extends Document>
  implements ITransactionManagerService<T>
{
  constructor(
    @Inject(ServiceToken.FAILED_TRANSACTION_SERVICE)
    private failedTransactionService: IFailedTransactionService,
    @Inject(ServiceToken.SEND_MAIL_SERVICE)
    private sendMailService: ISendMailService
  ) {}

  public async execute(
    transactionInstances: ITransactionInstance<T>[]
  ): Promise<void> {
    const successfullyProccesedTransactions: ITransactionInstance<T>[] = []
    const failedTransactions: IFailedTransactionDoc[] = []
    try {
      for (let i = 0; i < transactionInstances.length; i++) {
        const transactionInstance = transactionInstances[i]

        await transactionInstance.model.save()

        successfullyProccesedTransactions.push(transactionInstance)
      }
    } catch (err: any) {
      for (let i = 0; i < successfullyProccesedTransactions.length; i++) {
        const transactionInstance = successfullyProccesedTransactions[i]
        const collectionName = transactionInstance.model.collection.name
        try {
          await transactionInstance.callback()
          failedTransactions.push({
            collectionName,
            message: transactionInstance.onFailed,
            status: FailedTransactionStatus.SUCCESS,
          })
        } catch (err2: any) {
          console.log(err2)
          this.sendMailService.sendDeveloperErrorMail(err2)
          failedTransactions.push({
            collectionName,
            message: transactionInstance.onFailed,
            status: FailedTransactionStatus.FAILED,
          })
        }
      }

      if (failedTransactions.length) {
        try {
          const failedTransactionsResults: IFailedTransactionObject[] = []

          // Send Email
          this.sendMailService.sendDeveloperFailedTransactionMail(
            failedTransactions
          )
          this.sendMailService.sendAdminFailedTransactionMail(
            failedTransactions
          )

          for (let i = 0; i < failedTransactions.length; i++) {
            const params = failedTransactions[i]
            const transacton = await this.failedTransactionService.create(
              params.message,
              params.collectionName,
              params.status
            )

            failedTransactionsResults.push(transacton)
          }

          // websocket implementation
          // -----
          const response = {
            status: HttpResponseStatus.SUCCESS,
            message: 'Failed transaction registered successfully',
            data: { failedTransactions: failedTransactionsResults },
          }
        } catch (err3: any) {
          console.log(err3)
          this.sendMailService.sendDeveloperErrorMail(err3)
        }
      }

      throw new AppException(
        err,
        'Failed to process transactions, please try again later'
      )
    }
  }
}

export default TransactionManagerService
