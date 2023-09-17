import { IUser } from '@/modules/user/user.interface'
import { Document } from 'mongoose'

export interface IEmailVerification extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  key: string
  token: string
  expires: number

  isValidToken(token: string): Promise<undefined | boolean>
}

export interface IEmailVerificationService {
  create(user: IUser): Promise<string>

  verify(key: string, verifyToken: string): Promise<void>
}
