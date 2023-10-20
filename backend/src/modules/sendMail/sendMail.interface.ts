export interface ISendMailService {
  sendDeveloperMail(subject: string, content: string): Promise<void>

  sendDeveloperErrorMail(err: any): Promise<void>

  sendAdminMail(subject: string, content: string): Promise<void>

  sendCustomMail(
    email: string,
    subject: string,
    heading: string,
    content: string
  ): Promise<void>
}
