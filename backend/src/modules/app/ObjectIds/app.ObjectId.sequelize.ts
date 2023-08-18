import { isUuid, uuid } from 'uuidv4'

export default class AppObjectId {
  constructor(inputId?: any) {
    if (inputId) {
    }
    return uuid()
  }

  public static isValid(id: any): boolean {
    return isUuid(id)
  }
}
