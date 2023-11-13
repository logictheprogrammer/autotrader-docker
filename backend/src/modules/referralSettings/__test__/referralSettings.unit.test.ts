import { referralSettingsService } from '../../../setup'
import { request } from '../../../test'
import Helpers from '../../../utils/helpers'

describe('referralSettings', () => {
  request
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(referralSettingsService)
      expect(methods).toEqual([
        'referralSettingsModel',
        'create',
        'update',
        'fetch',
      ])
    })
  })
})
