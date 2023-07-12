import IHttpResponse from '@/modules/http/http.interface'

export const THttpResponse = Promise
export type THttpResponse<T = any> = Promise<IHttpResponse<T>>
