import { SiteConstants } from '@/modules/config/config.constants'
import nodemailer, { Transporter } from 'nodemailer'
import { Inject, Service } from 'typedi'
import { IMailDetails, IMailService } from '@/modules/mail/mail.interface'
import ServiceToken from '@/utils/enums/serviceToken'
import { IMailOptionService } from '@/modules/mailOption/mailOption.interface'
import HttpException from '@/modules/http/http.exception'
import AppException from '@/modules/app/app.exception'

@Service()
class MailService implements IMailService {
  private transporter: Transporter
  private username: string

  public constructor(
    @Inject(ServiceToken.MAIL_OPTION_SERVICE)
    private mailOptionService: IMailOptionService
  ) {
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_TLS,
      SMTP_SECURE,
      SMTP_USERNAME,
      SMTP_PASSWORD,
    } = process.env

    this.username = SMTP_USERNAME

    this.transporter = nodemailer.createTransport({
      // @ts-ignore
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: SMTP_TLS,
      },
    })
  }

  // CONFIGURE TRANSPORTER
  public async setSender(sender: string): Promise<void> {
    try {
      const mailOption = await this.mailOptionService.get(sender)
      if (!mailOption) throw new HttpException(404, 'Mail option not found')

      this.username = mailOption.username
      this.transporter = nodemailer.createTransport({
        host: mailOption.host,
        port: mailOption.port,
        secure: mailOption.secure,
        auth: {
          user: mailOption.username,
          pass: mailOption.password,
        },
        tls: {
          rejectUnauthorized: mailOption.tls,
        },
      })
    } catch (err: any) {
      throw new AppException(err, 'Unable to configure mail, please try again')
    }
  }

  //SEND MAIL
  async sendMail(details: IMailDetails) {
    try {
      const info = await this.transporter.sendMail({
        from: `${SiteConstants.siteName} <${this.username}>`,
        to: details.to,
        subject: details.subject,
        text: details.text,
        html: details.html,
      })
      console.log('Message sent: %s', info.messageId)
    } catch (err) {
      console.log(err)
    }
  }
  //VERIFY CONNECTION
  async verifyConnection() {
    return this.transporter.verify()
  }
  //CREATE TRANSPORTER
  getTransporter() {
    return this.transporter
  }
}

export default MailService
