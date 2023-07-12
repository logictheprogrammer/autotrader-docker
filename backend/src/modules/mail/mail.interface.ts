export interface IMailDetails {
  to: string
  subject: string
  text?: string
  html?: string
}

export interface IMailOptions {
  host: string
  port: number
  tls: boolean
  secure: boolean
  username: string
  password: string
}

export interface IMailService {
  sendMail(details: IMailDetails): Promise<void>
  setSender(sender: string): Promise<void>
  getTransporter(): any
  verifyConnection(): any
}
