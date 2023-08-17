import { request } from '../../../test'
import { transactionManagerService } from '../../../setup'

import { depositModelReturn } from '../../deposit/__test__/deposit.payload'
import {
  referralInstance,
  referralInstanceOnFailed,
  referralModelReturn,
} from '../../referral/__test__/referral.payoad'
import {
  notificationInstanceFailedSave,
  notificationModelReturnFailed,
} from '../../notification/__test__/notification.payload'
import {
  sendAdminFailedTransactionMailMock,
  sendDeveloperErrorMailMock,
  sendDeveloperFailedTransactionMailMock,
} from '../../sendMail/__test__/sendMail.mock'
import { createFailedTransactionMock } from '../../failedTransaction/__test__/failedTransaction.mock'
import { depositInstance } from '../../deposit/__test__/deposit.mock'

describe('transactionManager', () => {
  describe('execute', () => {
    describe('given three successfull instances', () => {
      it('should save all three', async () => {
        request

        const instances = [
          depositInstance,
          referralInstance,
          // notificationInstance,
        ]
        await transactionManagerService.execute(instances)

        expect(depositModelReturn.save).toHaveBeenCalledTimes(1)
        expect(referralModelReturn.save).toHaveBeenCalledTimes(1)
        // expect(notificationModelReturn.save).toHaveBeenCalledTimes(1)
      })
    })
    describe('given three instances and one failed', () => {
      it('should revert the last two and create a successful failed transactions and also send the developer and admin an email', async () => {
        const instances = [
          depositInstance,
          referralInstance,
          notificationInstanceFailedSave,
        ]

        await expect(
          transactionManagerService.execute(instances)
        ).rejects.toThrow(
          'Failed to process transactions, please try again later'
        )

        expect(depositModelReturn.save).toHaveBeenCalledTimes(1)
        expect(referralModelReturn.save).toHaveBeenCalledTimes(1)
        expect(notificationModelReturnFailed.save).toHaveBeenCalledTimes(1)
        expect(sendDeveloperFailedTransactionMailMock).toHaveBeenCalledTimes(1)
        expect(sendAdminFailedTransactionMailMock).toHaveBeenCalledTimes(1)
        expect(createFailedTransactionMock).toHaveBeenCalledTimes(2)

        expect(sendDeveloperErrorMailMock).toHaveBeenCalledTimes(0)
      })
    })
    describe('given three instances and one failed and another one failed to revert', () => {
      it('should create one successful and one failed, failed transactions and also send the developer and admin an email', async () => {
        const instances = [
          depositInstance,
          referralInstanceOnFailed,
          notificationInstanceFailedSave,
        ]

        await expect(
          transactionManagerService.execute(instances)
        ).rejects.toThrow(
          'Failed to process transactions, please try again later'
        )

        expect(depositModelReturn.save).toHaveBeenCalledTimes(1)
        expect(referralModelReturn.save).toHaveBeenCalledTimes(1)
        expect(notificationModelReturnFailed.save).toHaveBeenCalledTimes(1)
        expect(sendDeveloperFailedTransactionMailMock).toHaveBeenCalledTimes(1)
        expect(sendAdminFailedTransactionMailMock).toHaveBeenCalledTimes(1)
        expect(createFailedTransactionMock).toHaveBeenCalledTimes(2)

        expect(sendDeveloperErrorMailMock).toHaveBeenCalledTimes(1)
      })
    })
  })
})
