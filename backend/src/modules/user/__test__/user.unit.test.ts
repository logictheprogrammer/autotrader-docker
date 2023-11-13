import { userService } from '../../../setup'
import { request } from '../../../test'
import Helpers from '../../../utils/helpers'

describe('user', () => {
  request
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(userService)
      expect(methods).toEqual([
        'userModel',
        'notificationModel',
        'activityModel',
        'setFund',
        'fund',
        'fetchAll',
        'fetch',
        'updateProfile',
        'updateEmail',
        'updateStatus',
        'delete',
        'sendEmail',
        'count',
      ])
    })
  })
})
