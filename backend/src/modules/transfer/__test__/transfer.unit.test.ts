import { transferService } from '../../../setup'
import { request } from '../../../test'
import Helpers from '../../../utils/helpers'

describe('transfer', () => {
  request
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(transferService)
      expect(methods).toEqual([
        'transferModel',
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
