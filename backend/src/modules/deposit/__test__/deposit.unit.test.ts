import { depositService } from '../../../setup'
import { request } from '../../../test'
import Helpers from '../../../utils/helpers'

describe('deposit', () => {
  request
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(depositService)
      expect(methods).toEqual([
        'depositModel',
        'create',
        'delete',
        'updateStatus',
        'fetchAll',
        'count',
      ])
    })
  })
})
