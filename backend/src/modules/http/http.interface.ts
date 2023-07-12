import { HttpResponseStatus } from '@/modules/http/http.enum'

export default interface IHttpResponse<T = any> {
  status: HttpResponseStatus
  message: string
  data?: T
}
