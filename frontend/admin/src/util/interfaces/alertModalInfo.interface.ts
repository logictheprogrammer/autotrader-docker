import type { ResponseStatus } from '@/modules/http/http.enum'

export interface IAlertModalInfo {
  status: ResponseStatus
  title: string
  message: string
  onConfirm: Function
}
