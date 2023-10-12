import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { generate } from 'referral-codes'
import jwt from 'jsonwebtoken'
import { IUser } from '@/modules/user/user.interface'
import { Schema } from 'mongoose'

interface IToken {
  id: Schema.Types.ObjectId
  expiresIn: number
}

export default class Cryptograph {
  public static createToken(user: IUser): string {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET as jwt.Secret, {
      expiresIn: '1d',
    })
  }

  public static async verifyToken(token: string): Promise<IToken | void> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        process.env.JWT_SECRET as jwt.Secret,
        (err, payload) => {
          if (err) return resolve()
          resolve(payload as IToken)
        }
      )
    })
  }

  //Encrypting text
  public static encrypt(text: string) {
    const cipher = crypto.createCipheriv(
      process.env.CRYPTO_METHOD,
      Buffer.from(process.env.CRYPTO_KEY, 'hex'),
      Buffer.from(process.env.CRYPTO_IV, 'hex')
    )
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return encrypted.toString('hex')
  }

  // Decrypting text
  public static decrypt(encryptedData: string) {
    const encryptedText = Buffer.from(encryptedData, 'hex')
    const decipher = crypto.createDecipheriv(
      process.env.CRYPTO_METHOD,
      Buffer.from(process.env.CRYPTO_KEY, 'hex'),
      Buffer.from(process.env.CRYPTO_IV, 'hex')
    )
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  }

  public static async setHash(data: string | Buffer): Promise<string> {
    return await bcrypt.hash(data, 12)
  }

  public static async isValidHash(
    data: string | Buffer,
    hashed: string
  ): Promise<Error | boolean> {
    return await bcrypt.compare(data, hashed)
  }

  public static randomBytes(size: number): Buffer {
    return crypto.randomBytes(size)
  }

  public static generateCode(config: {
    length?: number
    count?: number
    charset?: string
    prefix?: string
    postfix?: string
    pattern?: string
  }): string[] {
    return generate(config)
  }
}
