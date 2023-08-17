import { SiteConstants } from '../../../modules/config/config.constants'
import { userA } from './../../user/__test__/user.payload'
import userModel from '../../../modules/user/user.model'
import { resetPasswordService } from '../../../setup'
import { request } from '../../../test'
import AppRepository from '../../app/app.repository'
import { IUser } from '../../user/user.interface'

const userRepository = new AppRepository<IUser>(userModel)

describe('ResetPasswordService', () => {
  request
  describe('create', () => {
    it('should create a verify link', async () => {
      const user = await userRepository.create(userA).save()
      const link = await resetPasswordService.create(user)

      const resetLink = `${SiteConstants.frontendLink}reset-password/${user.key}/`

      expect(link).toContain(resetLink)
    })
  })
})
