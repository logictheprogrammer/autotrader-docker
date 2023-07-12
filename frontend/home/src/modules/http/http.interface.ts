import type { ResponseStatus } from './http.enum'

export interface IHttpResponse<T = any> {
  status: ResponseStatus
  message: string
  data?: T
}
