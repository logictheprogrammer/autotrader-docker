import bcrypt from 'bcrypt'

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
}
