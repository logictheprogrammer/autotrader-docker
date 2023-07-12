import { SiteConstants } from '../../../modules/config/constants'
import { userA } from './../../user/__test__/user.payload'
import userModel from '../../../modules/user/user.model'
import { resetPasswordService } from '../../../setup'
import { request } from '../../../test'

describe('ResetPasswordService', () => {
  request
  describe('create', () => {
    it('should create a verify link', async () => {
      const user = await userModel.create(userA)
      const link = await resetPasswordService.create(user)

      const resetLink = `${SiteConstants.siteApi}authentication/reset-password/${user.key}/`

      expect(link).toContain(resetLink)
    })
  })
})
