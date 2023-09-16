import { HttpResponseStatus } from '@/modules/http/http.enum'
import { ErrorCode } from '@/utils/enums/errorCodes.enum'

class HttpException extends Error {
  constructor(
    public status: ErrorCode,
    public message: string,
    public statusStrength?: HttpResponseStatus
  ) {
    super(message)
  }
}

export default HttpException
