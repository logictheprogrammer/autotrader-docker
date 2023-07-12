import EmailVerificationService from '../emailVerification.service'

export const createEmailVerificationMock = jest
  .spyOn(EmailVerificationService.prototype, 'create')
  .mockResolvedValue('email verification link')
