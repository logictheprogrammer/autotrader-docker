import { IUser } from '@/modules/user/user.interface'
import AppDocument from '../app/app.document'

export interface IEmailVerification extends AppDocument {
  key: string
  token: string
  expires: number

  isValidToken(token: string): Promise<undefined | boolean>
}

export interface IEmailVerificationService {
  create(user: IUser): Promise<string>

  verify(key: string, verifyToken: string): Promise<void>
}
