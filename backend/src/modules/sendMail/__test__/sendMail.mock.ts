import SendMailService from '../sendMail.service'

export const sendDeveloperErrorMailMock = jest
  .spyOn(SendMailService.prototype, 'sendDeveloperErrorMail')
  .mockImplementation()

export const sendAdminMailMock = jest
  .spyOn(SendMailService.prototype, 'sendAdminMail')
  .mockImplementation()

export const sendDeveloperMailMock = jest
  .spyOn(SendMailService.prototype, 'sendAdminMail')
  .mockImplementation()
