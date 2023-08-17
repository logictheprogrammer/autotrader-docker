import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { generate } from 'referral-codes'

export default class AppCrypto {
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
