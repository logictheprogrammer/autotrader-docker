import { Document } from 'mongoose'
import { IUser } from '@/modules/user/user.interface'

export interface IEmailVerification extends Document {
  key: string
  token: string
  expires: number

  isValidToken(token: string): Promise<undefined | boolean>
}

export interface IEmailVerificationService {
  create(user: IUser): Promise<string>

  verify(key: string, verifyToken: string): Promise<void>
}
