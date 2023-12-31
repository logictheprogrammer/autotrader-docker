import Helpers from '../../../utils/helpers'
import renderFile from '../../../utils/renderFile'
import { authService } from '../../../setup'
import { request } from '../../../test'
import { sendMailMock } from '../../mail/__test__/mail.mock'
import { existingUser } from '../../user/__test__/user.payload'
import userModel from '../../user/user.model'
import { SiteConstants } from '../../config/config.constants'

describe('authentication', () => {
  describe('verify all methods', () => {
    it('Should match with the result', () => {
      const methods = Helpers.getClassMethods(authService)
      expect(methods).toEqual([
        'userModel',
        'emailVerification',
        'register',
        'login',
        'updatePassword',
        'forgetPassword',
        'resetPassword',
        'verifyEmail',
        'sendWelcomeMail',
        'sendResetPasswordMail',
        'sendEmailVerificationMail',
      ])
    })
  })
  describe('sendEmailVerificationMail', () => {
    it('should send an email verification email', async () => {
      request

      const verifyLink = 'the verify link'
      const subject = 'Please verify your email'

      await authService.sendEmailVerificationMail(
        existingUser.email,
        existingUser.username,
        verifyLink
      )

      const emailContent = await renderFile('email/verifyEmail', {
        verifyLink,
        username: existingUser.username,
        subject,
        config: SiteConstants,
      })

      expect(sendMailMock).toHaveBeenCalledTimes(1)
      expect(sendMailMock).toHaveBeenCalledWith({
        subject,
        to: existingUser.email,
        text: Helpers.clearHtml(emailContent),
        html: emailContent,
      })
    })
  })
  describe('sendResetPasswordMail', () => {
    it('should send a reset password email', async () => {
      request

      const resetLink = 'the verify link'
      const subject = 'Reset Password'

      await authService.sendResetPasswordMail(
        existingUser.email,
        existingUser.username,
        resetLink
      )

      const emailContent = await renderFile('email/resetPassword', {
        resetLink,
        username: existingUser.username,
      })

      expect(sendMailMock).toHaveBeenCalledTimes(1)
      expect(sendMailMock).toHaveBeenCalledWith({
        subject,
        to: existingUser.email,
        text: Helpers.clearHtml(emailContent),
        html: emailContent,
      })
    })
  })
  describe('sendWelcomeMail', () => {
    it('should send a welcome email', async () => {
      request

      const user = await userModel.create(existingUser)

      await authService.sendWelcomeMail(user)

      const name = Helpers.toTitleCase(user.name)
      const btnLink = `${SiteConstants.siteApi}users`
      const siteName = SiteConstants.siteName
      const subject = 'Welcome to ' + siteName

      const emailContent = await renderFile('email/welcome', {
        btnLink,
        name,
        siteName,
        config: SiteConstants,
      })

      expect(sendMailMock).toHaveBeenCalledTimes(1)
      expect(sendMailMock).toHaveBeenCalledWith({
        subject,
        to: existingUser.email,
        text: Helpers.clearHtml(emailContent),
        html: emailContent,
      })
    })
  })
})
