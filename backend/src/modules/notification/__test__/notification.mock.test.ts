import {
  NotificationCategory,
  NotificationForWho,
} from '../../../modules/notification/notification.enum'
import { request } from '../../../test'
import { userA } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { notificationService } from '../../../setup'
import { depositAObj } from '../../deposit/__test__/deposit.payload'
import { UserEnvironment } from '../../user/user.enum'
import { DepositStatus } from '../../deposit/deposit.enum'
import { IUser } from '../../user/user.interface'

describe('notification', () => {
  describe('_createNotification', () => {
    it('should return a notification instance', async () => {
      request
      const message = 'message here'
      const forWho = NotificationForWho.USER
      const status = DepositStatus.APPROVED
      const environment = UserEnvironment.LIVE
      const user = await userModel.create(userA)
      const categoryName = NotificationCategory.DEPOSIT

      const notificationInstance = await notificationService._createTransaction(
        message,
        categoryName,
        depositAObj,
        forWho,
        status,
        environment,
        user.toObject()
      )

      expect(notificationInstance.object.message).toBe(message)
      expect(+notificationInstance.object.forWho).toBe(forWho)
      expect(notificationInstance.object.categoryName).toBe(categoryName)
      expect(notificationInstance.object.environment).toBe(environment)

      expect(notificationInstance.instance.onFailed).toContain(
        `Delete the notification with an id of (${notificationInstance.instance.model._id})`
      )
    })
  })
})
