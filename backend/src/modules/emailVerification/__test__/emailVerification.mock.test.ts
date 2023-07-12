import { SiteConstants } from '../../../modules/config/constants'
import { userA } from './../../user/__test__/user.payload'
import userModel from '../../../modules/user/user.model'
import { emailVerificationService } from '../../../setup'
import { request } from '../../../test'

describe('EmailVerificationService', () => {
  request
  describe('create', () => {
    it('should create a verify link', async () => {
      const user = await userModel.create(userA)
      const link = await emailVerificationService.create(user)

      const verifyLink = `${SiteConstants.siteApi}authentication/verify-email/${user.key}/`

      expect(link).toContain(verifyLink)
    })
  })
})
