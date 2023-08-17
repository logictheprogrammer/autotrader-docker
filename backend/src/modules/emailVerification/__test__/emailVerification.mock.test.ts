import { SiteConstants } from '../../../modules/config/config.constants'
import { userA } from './../../user/__test__/user.payload'
import userModel from '../../../modules/user/user.model'
import { emailVerificationService } from '../../../setup'
import { request } from '../../../test'
import AppRepository from '../../app/app.repository'
import { IUser } from '../../user/user.interface'

const userRepository = new AppRepository<IUser>(userModel)

describe('EmailVerificationService', () => {
  request
  describe('create', () => {
    it('should create a verify link', async () => {
      const user = await userRepository.create(userA).save()
      const link = await emailVerificationService.create(user)

      const verifyLink = `${SiteConstants.frontendLink}verify-email/${user.key}/`

      expect(link).toContain(verifyLink)
    })
  })
})
