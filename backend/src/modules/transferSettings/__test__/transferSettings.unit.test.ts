import { transferSettingsService } from '../../../setup'
import { request } from '../../../test'
import Helpers from '../../../utils/helpers'

describe('transferSettings', () => {
  request
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(transferSettingsService)
      expect(methods).toEqual([
        'transferSettingsModel',
        'create',
        'update',
        'fetch',
      ])
    })
  })
})
