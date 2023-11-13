import { withdrawalService } from '../../../setup'
import { request } from '../../../test'
import Helpers from '../../../utils/helpers'

describe('withdrawal', () => {
  request
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(withdrawalService)
      expect(methods).toEqual([
        'withdrawalModel',
        'create',
        'delete',
        'updateStatus',
        'fetch',
        'fetchAll',
        'count',
      ])
    })
  })
})
