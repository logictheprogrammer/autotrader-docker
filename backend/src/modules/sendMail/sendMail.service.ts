import { Inject, Service } from 'typedi'
import { ISendMailService } from '@/modules/sendMail/sendMail.interface'
import { SiteConstants } from '@/modules/config/config.constants'
import renderFile from '@/utils/renderFile'
import ServiceToken from '@/utils/enums/serviceToken'
import { IMailService } from '@/modules/mail/mail.interface'
import { MailOptionName } from '@/modules/mailOption/mailOption.enum'
import { IFailedTransactionDoc } from '@/modules/failedTransaction/failedTransaction.interface'
import { THttpResponse } from '@/modules/http/http.type'
import { HttpResponseStatus } from '@/modules/http/http.enum'
import AppException from '@/modules/app/app.exception'
import ParseString from '@/utils/parsers/parseString'

@Service()
class SendMailService implements ISendMailService {
  public constructor(
    @Inject(ServiceToken.MAIL_SERVICE) private mailService: IMailService
  ) {}

  public async sendAdminMail(subject: string, content: string): Promise<void> {
    try {
      const email = ''

      if (!email) return
      const emailContent = await renderFile('email/info', {
        subject,
        content,
        config: SiteConstants,
      })

      this.mailService.sendMail({
        subject: subject,
        to: email,
        text: ParseString.clearHtml(emailContent),
        html: emailContent,
      })
    } catch (err) {
      console.log(err)
    }
  }

  public async sendAdminFailedTransactionMail(
    failedTransactions: IFailedTransactionDoc[]
  ): Promise<void> {
    try {
      const email = ''

      if (!email) return
      const subject = 'Failed Transaction(s) Registered'

      const emailContent = await renderFile('email/failedTransaction', {
        subject,
        failedTransactions,
        config: SiteConstants,
      })

      this.mailService.sendMail({
        subject: subject,
        to: email,
        text: ParseString.clearHtml(emailContent),
        html: emailContent,
      })
    } catch (err) {
      console.log(err)
    }
  }

  public async sendDeveloperMail(
    subject: string,
    content: string
  ): Promise<void> {
    try {
      const email = process.env.DEVELOPER_EMAIL

      if (!email) return
      const emailContent = await renderFile('email/info', {
        subject: subject + ' - ' + SiteConstants.siteLink,
        content,
        config: SiteConstants,
      })

      this.mailService.sendMail({
        subject: subject,
        to: email,
        text: ParseString.clearHtml(emailContent),
        html: emailContent,
      })
    } catch (err) {
      console.log(err)
    }
  }

  public async sendDeveloperFailedTransactionMail(
    failedTransactions: IFailedTransactionDoc[]
  ): Promise<void> {
    try {
      const email = process.env.DEVELOPER_EMAIL

      if (!email) return
      const subject =
        'Failed Transaction(s) Registered - ' + SiteConstants.siteLink

      const emailContent = await renderFile('email/failedTransaction', {
        subject,
        failedTransactions,
        config: SiteConstants,
      })

      this.mailService.sendMail({
        subject: subject,
        to: email,
        text: ParseString.clearHtml(emailContent),
        html: emailContent,
      })
    } catch (err) {
      console.log(err)
    }
  }

  public async sendDeveloperErrorMail(err: any): Promise<void> {
    try {
      const email = process.env.DEVELOPER_EMAIL

      if (!email) return
      const subject = 'New Error Found - ' + SiteConstants.siteLink
      const time = new Date()

      const errorObj: any = {}
      Object.getOwnPropertyNames(err).forEach((key) => {
        errorObj[key] = err[key]
      })
      const error = JSON.stringify(errorObj)

      const emailContent = await renderFile('email/error', {
        error,
        file: '',
        line: '',
        time,
        config: SiteConstants,
      })

      this.mailService.sendMail({
        subject: subject,
        to: email,
        text: ParseString.clearHtml(emailContent),
        html: emailContent,
      })
    } catch (err) {
      console.log(err)
    }
  }

  public async sendCustomMail(
    email: string,
    subject: string,
    heading: string,
    content: string
  ): THttpResponse {
    try {
      this.mailService.setSender(MailOptionName.TEST)

      const emailContent = await renderFile('email/custom', {
        heading,
        content,
        config: SiteConstants,
      })

      this.mailService.sendMail({
        subject: subject,
        to: email,
        text: ParseString.clearHtml(emailContent),
        html: emailContent,
      })

      return {
        status: HttpResponseStatus.SUCCESS,
        message: `Email has been sent successfully`,
      }
    } catch (err: any) {
      throw new AppException(err, 'Unable to send email, please try again')
    }
  }
}

export default SendMailService
