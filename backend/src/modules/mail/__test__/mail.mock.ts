import { mailService } from '../../../setup'

export const sendMailMock = jest
  .spyOn(mailService, 'sendMail')
  .mockImplementation()

export const setSenderMock = jest
  .spyOn(mailService, 'setSender')
  .mockImplementation()
