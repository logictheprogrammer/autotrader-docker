import { Types } from 'mongoose'

export default class AppObjectId {
  constructor(inputId?: any) {
    return new Types.ObjectId(inputId)
  }

  public static isValid(id: any): boolean {
    return Types.ObjectId.isValid(id)
  }
}
