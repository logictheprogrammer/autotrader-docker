import { resetPasswordService } from '../../../setup'

export const createResetPasswordMock = jest
  .spyOn(resetPasswordService, 'create')
  .mockResolvedValue('password reset link')
