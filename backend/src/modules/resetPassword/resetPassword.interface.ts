import { IUser } from '@/modules/user/user.interface'

export interface IResetPassword extends Document {
  __v: number
  updatedAt: Date
  createdAt: Date
  key: string
  token: string
  expires: number

  isValidToken(token: string): Promise<undefined | boolean>
}

export interface IResetPasswordService {
  create(user: IUser): Promise<string>

  verify(key: string, verifyToken: string): Promise<void>
}
