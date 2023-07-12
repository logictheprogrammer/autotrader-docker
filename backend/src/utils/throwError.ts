import HttpException from '@/modules/http/http.exception'

export default class ThrowError {
  public static isNotValidEnum(
    enumObject: Object,
    value: any,
    errorMessage: string,
    errorCode: number = 400
  ): void {
    if (!Object.values(enumObject).includes(value))
      throw new HttpException(errorCode, errorMessage)
  }
}
