import { IBaseObject } from '@/util/interface'
import type { NotificationForWho, NotificationTitle } from './notification.enum'
import { IUser } from '../user/user.interface'
import { UserEnvironment } from '../user/user.enum'

export interface INotification extends IBaseObject {
  user?: IUser
  message: string
  read: boolean
  title: NotificationTitle
  object: IBaseObject
  forWho: NotificationForWho
  environment: UserEnvironment
}
