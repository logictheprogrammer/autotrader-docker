import { sendMailService } from '../../../setup'

export const sendDeveloperErrorMailMock = jest
  .spyOn(sendMailService, 'sendDeveloperErrorMail')
  .mockImplementation()

export const sendAdminMailMock = jest
  .spyOn(sendMailService, 'sendAdminMail')
  .mockImplementation()

export const sendDeveloperMailMock = jest
  .spyOn(sendMailService, 'sendAdminMail')
  .mockImplementation()
