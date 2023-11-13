import { sendMailService } from '../../../setup'
import { request } from '../../../test'
import Helpers from '../../../utils/helpers'

describe('sendMail', () => {
  request
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(sendMailService)
      expect(methods).toEqual([
        'sendAdminMail',
        'sendDeveloperMail',
        'sendDeveloperErrorMail',
        'sendCustomMail',
      ])
    })
  })
})
