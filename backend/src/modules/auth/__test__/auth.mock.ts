import AuthService from '../../../modules/auth/auth.service'

export const sendEmailVerificationMailMock = jest
  .spyOn(AuthService.prototype, 'sendEmailVerificationMail')
  .mockImplementation()

export const sendWelcomeMailMock = jest
  .spyOn(AuthService.prototype, 'sendWelcomeMail')
  .mockImplementation()

export const sendResetPasswordMailMock = jest
  .spyOn(AuthService.prototype, 'sendResetPasswordMail')
  .mockImplementation()
