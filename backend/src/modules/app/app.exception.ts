import HttpException from '@/modules/http/http.exception'

export default class AppException extends HttpException {
  constructor(public err: any, public defaultMessage: string) {
    console.log(err)
    const status = err.status || 500
    const message = err.status ? err.message : defaultMessage

    super(status, message, err.statusStrength)
  }
}
