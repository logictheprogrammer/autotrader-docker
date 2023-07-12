import { HttpResponseStatus } from '@/modules/http/http.enum'

class HttpException extends Error {
  constructor(
    public status: number,
    public message: string,
    public statusStrength?: HttpResponseStatus
  ) {
    super(message)
  }
}

export default HttpException
