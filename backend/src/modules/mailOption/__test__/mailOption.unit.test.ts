import { mailOptionService } from '../../../setup'
import { request } from '../../../test'
import Helpers from '../../../utils/helpers'

describe('mailOption', () => {
  request
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(mailOptionService)
      expect(methods).toEqual([
        'mailOptionModel',
        'create',
        'fetch',
        'fetchAll',
        'count',
      ])
    })
  })
})
