import { UserRole } from '@/modules/user/user.enum'
import {
  ActivityCategory,
  ActivityForWho,
  ActivityStatus,
} from '@/modules/activity/activity.enum'
import { IUser, IUserObject } from '@/modules/user/user.interface'
import { THttpResponse } from '@/modules/http/http.type'
import AppObjectId from '../app/app.objectId'
import AppDocument from '../app/app.document'

export interface IActivity extends AppDocument {
  __v: number
  updatedAt: Date
  createdAt: Date
  user: IUser['_id']
  userObject: IUserObject
  category: ActivityCategory
  message: string
  status: ActivityStatus
  forWho: ActivityForWho
}

export interface IActivityRepositry {}

export interface IActivityService {
  set(
    user: IUserObject,
    forWho: ActivityForWho,
    category: ActivityCategory,
    message: string
  ): Promise<IActivity>

  fetchAll(
    role: UserRole,
    forWho: ActivityForWho,
    userId?: AppObjectId
  ): THttpResponse<{ activities: IActivity[] }>

  hide(
    userId: AppObjectId,
    activityId: AppObjectId,
    forWho: ActivityForWho
  ): THttpResponse<{ activity: IActivity }>

  hideAll(userId: AppObjectId, forWho: ActivityForWho): THttpResponse

  delete(
    activityId: AppObjectId,
    forWho: ActivityForWho,
    userId?: AppObjectId
  ): THttpResponse<{ activity: IActivity }>

  deleteAll(
    allUsers: boolean,
    forWho: ActivityForWho,
    userId: AppObjectId
  ): THttpResponse
}
