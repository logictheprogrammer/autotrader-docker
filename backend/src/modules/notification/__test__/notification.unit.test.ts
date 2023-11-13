import {
  NotificationTitle,
  NotificationForWho,
} from '../../../modules/notification/notification.enum'
import { request } from '../../../test'
import { userAInput } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { notificationService } from '../../../setup'
import { depositAObj } from '../../deposit/__test__/deposit.payload'
import { UserEnvironment } from '../../user/user.enum'
import Helpers from '../../../utils/helpers'

describe('notification', () => {
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(notificationService)
      expect(methods).toEqual([
        'notificationModel',
        'create',
        'delete',
        'read',
        'fetchAll',
        'count',
      ])
    })
  })
  describe('create', () => {
    it('should return a notification', async () => {
      request
      const message = 'message here'
      const forWho = NotificationForWho.USER
      const environment = UserEnvironment.LIVE
      const user = await userModel.create(userAInput)
      const title = NotificationTitle.DEPOSIT_MADE

      const notification = await notificationService.create(
        message,
        title,
        depositAObj,
        forWho,
        environment,
        user.toObject()
      )

      expect(notification.message).toBe(message)
      expect(+notification.forWho).toBe(forWho)
      expect(notification.title).toBe(title)
      expect(notification.environment).toBe(environment)
    })
  })
})
