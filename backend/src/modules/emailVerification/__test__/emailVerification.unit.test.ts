import { SiteConstants } from '../../../modules/config/config.constants'
import { userAInput } from './../../user/__test__/user.payload'
import userModel from '../../../modules/user/user.model'
import { emailVerificationService } from '../../../setup'
import { request } from '../../../test'
import Helpers from '../../../utils/helpers'

describe('EmailVerificationService', () => {
  request
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(emailVerificationService)
      expect(methods).toEqual(['emailVerificationModel', 'create', 'verify'])
    })
  })
  describe('create', () => {
    it('should create a verify link', async () => {
      const user = await userModel.create(userAInput)
      const link = await emailVerificationService.create(user)

      const verifyLink = `${SiteConstants.frontendLink}verify-email/${user.key}/`

      expect(link).toContain(verifyLink)
    })
  })
})
