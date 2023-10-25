import {
  NotificationCategory,
  NotificationForWho,
} from '../../../modules/notification/notification.enum'
import { request } from '../../../test'
import { userAInput } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { notificationService } from '../../../setup'
import { depositAObj } from '../../deposit/__test__/deposit.payload'
import { UserEnvironment } from '../../user/user.enum'
import { DepositStatus } from '../../deposit/deposit.enum'

describe('notification', () => {
  describe('create', () => {
    it('should return a notification', async () => {
      request
      const message = 'message here'
      const forWho = NotificationForWho.USER
      const status = DepositStatus.APPROVED
      const environment = UserEnvironment.LIVE
      const user = await userModel.create(userAInput)
      const categoryName = NotificationCategory.DEPOSIT

      const notification = await notificationService.create(
        message,
        categoryName,
        depositAObj,
        forWho,
        status,
        environment,
        user.toObject()
      )

      expect(notification.message).toBe(message)
      expect(+notification.forWho).toBe(forWho)
      expect(notification.categoryName).toBe(categoryName)
      expect(notification.environment).toBe(environment)
    })
  })
})
