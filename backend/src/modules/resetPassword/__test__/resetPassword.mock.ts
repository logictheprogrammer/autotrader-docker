import resetPasswordService from '../resetPassword.service'

export const createResetPasswordMock = jest
  .spyOn(resetPasswordService.prototype, 'create')
  .mockResolvedValue('password reset link')
