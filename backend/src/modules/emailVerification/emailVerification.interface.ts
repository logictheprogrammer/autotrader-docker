import baseModelInterface from '@/core/baseModelInterface'
import baseObjectInterface from '@/core/baseObjectInterface'
import { IUser } from '@/modules/user/user.interface'

// @ts-ignore
export interface IEmailVerification
  extends baseObjectInterface,
    baseModelInterface {
  key: string
  token: string
  expires: number

  isValidToken(token: string): Promise<boolean>
}

export interface IEmailVerificationService {
  create(user: IUser): Promise<string>

  verify(key: string, verifyToken: string): Promise<void>
}
