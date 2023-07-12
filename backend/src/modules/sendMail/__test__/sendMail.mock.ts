import SendMailService from '../sendMail.service'

export const sendDeveloperFailedTransactionMailMock = jest
  .spyOn(SendMailService.prototype, 'sendDeveloperFailedTransactionMail')
  .mockImplementation()

export const sendDeveloperErrorMailMock = jest
  .spyOn(SendMailService.prototype, 'sendDeveloperErrorMail')
  .mockImplementation()

export const sendAdminFailedTransactionMailMock = jest
  .spyOn(SendMailService.prototype, 'sendAdminFailedTransactionMail')
  .mockImplementation()
