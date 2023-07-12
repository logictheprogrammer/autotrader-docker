import MailService from '../../../modules/mail/mail.service'

export const sendMailMock = jest
  .spyOn(MailService.prototype, 'sendMail')
  .mockImplementation()

export const setSenderMock = jest
  .spyOn(MailService.prototype, 'setSender')
  .mockImplementation()
