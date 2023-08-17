import { Types } from 'mongoose'

export default class AppObjectId {
  constructor(inputId?: any) {
    // super(inputId)
    return new Types.ObjectId(inputId)
  }

  public static isValid(id: any): boolean {
    return Types.ObjectId.isValid(id)
  }
}
