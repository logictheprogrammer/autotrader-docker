import { authService } from '../../../setup'

export const sendEmailVerificationMailMock = jest
  .spyOn(authService, 'sendEmailVerificationMail')
  .mockImplementation()

export const sendWelcomeMailMock = jest
  .spyOn(authService, 'sendWelcomeMail')
  .mockImplementation()

export const sendResetPasswordMailMock = jest
  .spyOn(authService, 'sendResetPasswordMail')
  .mockImplementation()
