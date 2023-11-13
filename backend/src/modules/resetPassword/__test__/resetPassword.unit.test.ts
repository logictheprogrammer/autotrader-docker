import { SiteConstants } from '../../../modules/config/config.constants'
import { userA, userAInput } from './../../user/__test__/user.payload'
import userModel from '../../../modules/user/user.model'
import { resetPasswordService } from '../../../setup'
import { request } from '../../../test'
import { IUser } from '../../user/user.interface'
import Helpers from '../../../utils/helpers'

describe('ResetPasswordService', () => {
  request
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(resetPasswordService)
      expect(methods).toEqual(['resetPasswordModel', 'create', 'verify'])
    })
  })
  describe('create', () => {
    it('should create a verify link', async () => {
      const user = await userModel.create(userAInput)
      const link = await resetPasswordService.create(user)

      const resetLink = `${SiteConstants.frontendLink}reset-password/${user.key}/`

      expect(link).toContain(resetLink)
    })
  })
})
