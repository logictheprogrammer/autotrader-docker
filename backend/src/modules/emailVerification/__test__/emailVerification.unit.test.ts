import { SiteConstants } from '../../../modules/config/config.constants'
import { userAInput } from './../../user/__test__/user.payload'
import userModel from '../../../modules/user/user.model'
import { emailVerificationService } from '../../../setup'
import { request } from '../../../test'

describe('EmailVerificationService', () => {
  request
  describe('create', () => {
    it('should create a verify link', async () => {
      const user = await userModel.create(userAInput)
      const link = await emailVerificationService.create(user)

      const verifyLink = `${SiteConstants.frontendLink}verify-email/${user.key}/`

      expect(link).toContain(verifyLink)
    })
  })
})
