import { emailVerificationService } from '../../../setup'

export const createEmailVerificationMock = jest
  .spyOn(emailVerificationService, 'create')
  .mockResolvedValue('email verification link')
